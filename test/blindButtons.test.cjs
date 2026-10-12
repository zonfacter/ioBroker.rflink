const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {EventEmitter} = require('node:events');
const Buttons = require('../lib/blindButtons');
const Parses = require('../admin/parse');

const blind = (brand = 'HTR008W', channel = '00') => ({type:'state', common:{write:true}, native:{brand, ID:1, switch:channel, attr:'CMD', blind:true}});

test('create a separate UP, STOP and DOWN button for each decoded channel', () => {
    for (const [brand, channel] of [['HTR008W','00'],['ShutterRemote40','41'],['ShutterRemote40','45'],['ShutterRemote40','40']]) {
        const objects = Buttons.createBlindButtons('rflink.0.channels.remote.BLIND_' + channel, blind(brand,channel));
        assert.equal(objects.length,3);
        assert.deepEqual(objects.map(x=>x.native.fixedCommand),['UP','STOP','DOWN']);
        for (const obj of objects) {
            assert.equal(obj.native.switch,channel);
            assert.equal(obj.common.role,'button');
        }
    }
    assert.deepEqual(Buttons.createBlindButtons('x',{native:{brand:'sensor'}}),[]);
    assert.deepEqual(Buttons.createBlindButtons('x',{native:{...blind().native,stop:true}}),[]);
});

test('preserve existing short HTR button IDs', () => {
    const existing={'rflink.0.channels.HTR008W_1.UP':{native:{brand:'HTR008W',ID:1,switch:'00',fixedCommand:'UP'}}};
    assert.equal(Buttons.createBlindButtons('rflink.0.channels.HTR008W_1.BLIND_00',blind(),existing)[0]._id,'rflink.0.channels.HTR008W_1.UP');
});

function environment() {
    const objects = new Map([
        ['rflink.0.channels.HTR008W_1',{type:'channel',native:{brand:'HTR008W',ID:1}}],
        ['rflink.0.channels.HTR008W_1.BLIND_00',blind()],
        ['rflink.0.channels.Nobily_1',{type:'channel',native:{brand:'ShutterRemote40',ID:1}}],
        ['rflink.0.channels.Nobily_1.BLIND_41',blind('ShutterRemote40','41')]
    ]);
    const values = new Map(), written = [], connections = [];
    class MockAdapter extends EventEmitter {
        constructor() {super();this.namespace='rflink.0';this.config={inclusionTimeout:0};this.log={debug(){},info(){},warn(){},error(){}};}
        getState(id,cb){cb(null,{val:false});}
        setState(id,val,ack){values.set('rflink.0.'+id,{val,ack});}
        setForeignState(id,val,ack,cb){values.set(id,{val,ack});cb?.();}
        getForeignObject(id,cb){cb(null,objects.get(id));}
        setForeignObject(id,obj,cb){objects.set(id,obj);cb?.();}
        getForeignObjects(pattern,type,cb){cb(null,Object.fromEntries([...objects].filter(([,obj])=>obj.type===type)));}
        subscribeStates(){}
        subscribeObjects(){}
    }
    class MockSerial extends EventEmitter {
        constructor(config,log,cb){super();connections.push(this);queueMicrotask(()=>cb());}
        write(command,cb){written.push(command);cb?.();}
        destroy(){}
    }
    const adapter = new MockAdapter();
    const context={module:{parent:{},exports:{}},process:{env:{}},setTimeout,clearTimeout,clearInterval,console,
        require(name){
            if(name==='@iobroker/adapter-core')return {Adapter:class{constructor(){return adapter;}}};
            if(name==='./package.json')return {name:'iobroker.rflink'};
            if(name==='./admin/parse.js')return Parses;
            if(name==='./lib/blindButtons')return Buttons;
            if(name==='./lib/serial.js')return MockSerial;
            if(name==='serialport')return {SerialPort:{}};
            if(name==='./lib/flash.js')return ()=>{};
            throw Error('Unexpected require: '+name);
        }};
    vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/../main.js','utf8'),context);
    context.module.exports({});adapter.emit('ready');
    return {context,adapter,objects,values,written,connections};
}

test('adapter startup migrates existing blinds without sending movement commands', async () => {
    const env=environment();await Promise.resolve();
    assert(env.objects.has('rflink.0.channels.HTR008W_1.UP_00'));
    assert(env.objects.has('rflink.0.channels.Nobily_1.DOWN_41'));
    assert(!env.written.some(x=>/;(UP|STOP|DOWN);/.test(x)));
    const count=env.objects.size;
    vm.runInContext('ensureBlindButtons()',env.context);
    assert.equal(env.objects.size,count);
});

test('actual state handler routes fixed buttons and resets them, ignores false and ack', async () => {
    const env=environment();await Promise.resolve();env.written.length=0;
    for(const command of ['UP','STOP','DOWN']){
        const id='rflink.0.channels.HTR008W_1.'+command+'_00';
        env.adapter.emit('stateChange',id,{val:true,ack:false});
        assert.equal(env.written.at(-1),`10;HTR008W;000001;00;${command};`);
        assert.deepEqual(env.values.get(id),{val:false,ack:true});
        const count=env.written.length;
        env.adapter.emit('stateChange',id,{val:false,ack:false});
        env.adapter.emit('stateChange',id,{val:true,ack:true});
        assert.equal(env.written.length,count);
    }
    const id='rflink.0.channels.HTR008W_1.BLIND_00';
    env.adapter.emit('stateChange',id,{val:false,ack:false});
    assert.equal(env.written.at(-1),'10;HTR008W;000001;00;DOWN;');
});

test('newly included blinds receive buttons and incoming UP feedback stays true', async () => {
    const env=environment();await Promise.resolve();
    env.adapter.emit('stateChange','rflink.0.inclusionOn',{val:true,ack:false});
    const frame=Parses.parseString('20;01;ShutterRemote40;ID=123456;SWITCH=42;CMD=UP;');
    assert.equal(frame.CMD,true);
    assert.equal(Parses.parseString('20;01;HTR008W;ID=000001;SWITCH=00;CMD=DOWN;').CMD,false);
    env.context.frame=frame;
    await new Promise(resolve=>{env.context.done=resolve;vm.runInContext('addNewDevice(frame,"CMD",done)',env.context);});
    assert(env.objects.has('rflink.0.channels.ShutterRemote40_1.UP_42'));
    assert(env.objects.has('rflink.0.channels.ShutterRemote40_1.STOP_42'));
    assert(env.objects.has('rflink.0.channels.ShutterRemote40_1.DOWN_42'));
    assert.equal(env.values.get('rflink.0.channels.ShutterRemote40_1.UP_42').val,false);
    assert(!env.written.some(x=>/;(UP|STOP|DOWN);/.test(x)));
});

test('invalid fixed commands are rejected',()=>{
    assert.throws(()=>Buttons.fixedCommandValue({fixedCommand:'PAIR'},true));
});
