'use strict';

const COMMANDS = ['UP', 'STOP', 'DOWN'];

/** Build momentary controls from a decoded blind state, never from an RF fingerprint. */
function createBlindButtons(blindId, blind, existingStates = {}) {
    const native = blind && blind.native;
    if (!native || !native.blind || native.stop || native.fixedCommand || native.switch === undefined) return [];
    const parent = blindId.slice(0, blindId.lastIndexOf('.'));
    const channel = String(native.switch);
    return COMMANDS.map(command => {
        // Preserve controls installed before the automatic migration was available.
        const existing = Object.keys(existingStates).find(id =>
            id.slice(0, id.lastIndexOf('.')) === parent &&
            existingStates[id].native &&
            existingStates[id].native.brand === native.brand &&
            existingStates[id].native.ID === native.ID &&
            String(existingStates[id].native.switch) === channel &&
            existingStates[id].native.fixedCommand === command);
        return {
            _id: existing || `${parent}.${command}_${channel.replace(/[.\s]/g, '_')}`,
            type: 'state',
            common: {name: `${native.brand} ${channel}: ${command}`, type: 'boolean', role: 'button', read: true, write: true},
            native: {brand: native.brand, ID: native.ID, switch: native.switch, attr: 'CMD', fixedCommand: command}
        };
    });
}

/** False/reset writes cannot move a motor. Existing blind boolean commands stay separate. */
function fixedCommandValue(native, value) {
    if (native.fixedCommand === undefined) return undefined;
    if (!COMMANDS.includes(native.fixedCommand)) throw new Error('Invalid RFLink fixedCommand');
    return value === true || value === 'true' || value === 1 || value === '1' ? native.fixedCommand : null;
}

module.exports = {createBlindButtons, fixedCommandValue};
