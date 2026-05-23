#!/usr/bin/env node
/**
 * Builds supression_spells_dialogue.omwaddon:
 *   1× NPC_  record for Lillemare (High Elf Sorcerer)
 *   1× CELL  record placing Lillemare in Tel Vos, Central Tower
 *   1× Journal DIAL (lm_quest) with INFO entries at stages 10 and 100
 *   1× Topic DIAL (suppression magic) with INFO chain for quest dialogue
 *
 * Run: node tools/build_esp.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'supression_spells_dialogue.omwaddon');

// ---------------------------------------------------------------------------
// NPC definition
// ---------------------------------------------------------------------------
const NPC_RECORD_ID = 'lm_lillemare';
const NPC_NAME = 'Lillemare';
const NPC_RACE = 'High Elf';
const NPC_CLASS = 'Sorcerer';
const NPC_LEVEL = 15;
const NPC_DISPOSITION = 50;
const NPC_GOLD = 200;
const NPC_FEMALE = true;
const NPC_HEAD = 'b_n_high elf_f_head_01';
const NPC_HAIR = 'b_n_high elf_f_hair_01';

// ---------------------------------------------------------------------------
// Custom item — "Hindsight" (Gondolier helm + Sound CE)
// ---------------------------------------------------------------------------
const CUSTOM_HELM_ID = 'lm_timetravellers_guide';
const CUSTOM_HELM_NAME = 'Hindsight';
const CUSTOM_HELM_MODEL = 'a\\A_Gondolier_M_Helmet.NIF';
const CUSTOM_HELM_ICON = 'a\\tx_gondolier_helm.tga';
const CUSTOM_HELM_BODYPART = 'A_Gondolier_M_Helmet';
const CUSTOM_ENCH_ID = 'lm_timetravellers_ench';

// ---------------------------------------------------------------------------
// Custom item — "Foresight"
// Based on light_de_buglamp_01_64 (duration -1 = infinite in OpenMW).
// Foresight: radius 64, value 5000, mysticism purple tint.
// ---------------------------------------------------------------------------
const CUSTOM_LIGHT_ID = 'lm_foresight';
const CUSTOM_LIGHT_NAME = 'Foresight';
const CUSTOM_LIGHT_MODEL = 'l\\Light_buglamp_01.NIF';
const CUSTOM_LIGHT_ICON = 'l\\Tx_buglamp_01.tga';
// NPC inventory — 1 count of each, custom items + standard gear
const NPC_INVENTORY = [
    CUSTOM_HELM_ID,
    CUSTOM_LIGHT_ID,
    'heavy_leather_boots',
    'dreugh_cuirass',
    'extravagant_pants_01',
    'templar skirt obj',
    'common_shirt_01',
    'BM_Nordic02_gloveL',
    'BM_Nordic02_gloveR',
];

const CELL_NAME = 'Tel Vos, Central Tower';
const NPC_POS_X = 1730.5;
const NPC_POS_Y = 1500.86;
const NPC_POS_Z = 16129.0;
const NPC_ROT_X = 0.0;
const NPC_ROT_Y = 0.0;
const NPC_ROT_Z = 0.0;

// ---------------------------------------------------------------------------
// Quest / journal
// ---------------------------------------------------------------------------
const JOURNAL_ID = 'lm_quest';
const JOURNAL_FIRST_MEET_STAGE = 10;
const JOURNAL_FIRST_MEET_TEXT =
    'A strange sorcerer in the Dwemer Museum of Tel Vos offered to train me if I bring ' +
    'them 20 Hackle-Lo Leaf. Seems a bit excessive.';
const JOURNAL_COMPLETE_STAGE = 100;
const JOURNAL_COMPLETE_TEXT =
    'I brought Lillemare 20 Hackle-Lo Leaf. They offered to teach me spellcraft ' +
    'that in their words was \'lost to time\'';

// ---------------------------------------------------------------------------
// Dialogue — Greeting 1 for Lillemare
// ---------------------------------------------------------------------------
const GREETING_DIAL_ID = 'Greeting 1';

const HACKLE_LO_ID = 'ingred_hackle-lo_leaf_01';
const HACKLE_LO_COUNT = 20;

const FUNCTION_CHOICE = 50;
const CHOICE_REFUSE = 1;
const CHOICE_ACCEPT = 2;
const CHOICE_GOODBYE = 3;

const SPELL_IDS = [
    'lm_sup_magicka_self',
    'lm_sup_magicka_touch',
    'lm_sup_magicka_target',
    'lm_sup_enchant_self',
    'lm_sup_enchant_touch',
    'lm_sup_enchant_target',
];

const NPC_SELL_SPELLS = SPELL_IDS;

// Greeting INFO nodes (evaluated top-to-bottom; first match wins).
// All are filtered to actor=lm_lillemare via ONAM.
//
//   1. LM_G_DONE  — journal >= 100 (post-completion)
//   2. LM_G_HAVE  — journal >= 10, choice=2, has 20 leaves (turn-in success)
//   3. LM_G_LACK  — journal >= 10, choice=2 (turn-in fail: not enough)
//   4. LM_G_NOT   — journal >= 10, choice=1 ("Not yet")
//   5. LM_G_RUDE  — choice=1 ("Get it yourself" — pre-quest)
//   6. LM_G_SURE  — choice=2 ("Sure" — accept quest)
//   7. LM_G_BYE   — choice=3 (Goodbye from either state)
//   8. LM_G_RET   — journal >= 10 (return visit, show choices)
//   9. LM_G_INTRO — default (first meeting, show choices)
const GREETING_INFOS = [
    {
        id: 'LM_G_DONE',
        text:
            'yes yes, how interesting... haven\'t seen any airships lately have you? ' +
            'No... how unhelpful.',
        conditions: [
            { type: 'journal', journalId: JOURNAL_ID, value: JOURNAL_COMPLETE_STAGE },
        ],
        resultScript: null,
    },
    {
        id: 'LM_G_HAVE',
        text:
            'yes, yes, here it is.... ah. I hope you don\'t mind. How about that training?',
        conditions: [
            { type: 'journal', journalId: JOURNAL_ID, value: JOURNAL_FIRST_MEET_STAGE },
            { type: 'choice', value: CHOICE_ACCEPT },
            { type: 'item', itemId: HACKLE_LO_ID, count: HACKLE_LO_COUNT },
        ],
        resultScript:
            `RemoveItem "${HACKLE_LO_ID}" ${HACKLE_LO_COUNT}\r\n` +
            `"${NPC_RECORD_ID}"->AddItem "${HACKLE_LO_ID}" ${HACKLE_LO_COUNT}\r\n` +
            `Journal "${JOURNAL_ID}" ${JOURNAL_COMPLETE_STAGE}`,
    },
    {
        id: 'LM_G_LACK',
        text: 'damn you, you imbecile',
        conditions: [
            { type: 'journal', journalId: JOURNAL_ID, value: JOURNAL_FIRST_MEET_STAGE },
            { type: 'choice', value: CHOICE_ACCEPT },
        ],
        resultScript: 'Goodbye',
    },
    {
        id: 'LM_G_NOT',
        text: 'Get on with it',
        conditions: [
            { type: 'journal', journalId: JOURNAL_ID, value: JOURNAL_FIRST_MEET_STAGE },
            { type: 'choice', value: CHOICE_REFUSE },
        ],
        resultScript: 'Goodbye',
    },
    {
        id: 'LM_G_RUDE',
        text:
            'How rude. I\'ll petition Sheogorath to ensure that rock in the sky has your name on it.',
        conditions: [
            { type: 'choice', value: CHOICE_REFUSE },
        ],
        resultScript: 'Goodbye',
    },
    {
        id: 'LM_G_SURE',
        text: 'Very good - I\'ll be here waiting as I have some research to attend to.',
        conditions: [
            { type: 'choice', value: CHOICE_ACCEPT },
        ],
        resultScript:
            `Journal "${JOURNAL_ID}" ${JOURNAL_FIRST_MEET_STAGE}\r\nGoodbye`,
    },
    {
        id: 'LM_G_BYE',
        text: 'Farewell.',
        conditions: [
            { type: 'choice', value: CHOICE_GOODBYE },
        ],
        resultScript: 'Goodbye',
    },
    {
        id: 'LM_G_RET',
        text:
            'Have you brought it? The Leaf? This damnable island\'s ancestors are too loud ' +
            '- I need to focus %PCName. Please hurry.',
        conditions: [
            { type: 'journal', journalId: JOURNAL_ID, value: JOURNAL_FIRST_MEET_STAGE },
        ],
        resultScript:
            `Choice "Not yet" ${CHOICE_REFUSE}, ` +
            `"Here it is" ${CHOICE_ACCEPT}`,
    },
    {
        id: 'LM_G_INTRO',
        text:
            'I\'d love to chat but I\'m here on a mission you see. I am in need of some, ' +
            'I believe you\'d call it Hackle-Lo Leaf. 20 pieces ought to do it. I need it. ' +
            'It helps me ... focus. Yes, that\'s it, it helps me focus. Will you bring me ' +
            '20 pieces, I can offer you some training as a reward.',
        conditions: [],
        resultScript:
            `Choice "Get it yourself." ${CHOICE_REFUSE}, ` +
            `"Sure, I can bring you some Hackle-Lo Leaf" ${CHOICE_ACCEPT}`,
    },
];

// ---------------------------------------------------------------------------
// NPC-specific topics — always available when talking to Lillemare
// ---------------------------------------------------------------------------
const NPC_TOPICS = [
    {
        id: 'LM_T_BG',
        topic: 'background',
        text:
            'I\'m a traveller of sorts... yes, traveller, that\'ll do. I quite like it here, ' +
            'I\'ve a strong affection for these grazelands and their bounty.',
    },
    {
        id: 'LM_T_TRAIN',
        topic: 'training as a reward',
        text:
            'I can teach you incantations you\'ve likely never heard before, they\'re long ' +
            'forgotten. Well, not forgotten in the way you might consider it forgotten, as ' +
            'your kind likely hasn\'t even begun to consider it, not-gotten? No, lost to time. ' +
            'That\'s better. Yes, these incantations are lost to time.',
    },
    {
        id: 'LM_T_FORG',
        topic: 'forgotten',
        text: 'As I said, not forgotten. It\'s better we don\'t speak of this.',
    },
    {
        id: 'LM_T_FOCUS',
        topic: 'helps me focus',
        text:
            'You really ought to indulge. There\'s nothing like it Grazelands Leaf and you ' +
            'can\'t get it ever since... Better not to speak of it actually.',
    },
    {
        id: 'LM_T_RESEARCH',
        topic: 'research to attend to',
        text:
            'I\'ve need of an airship but it seems I\'m too late, or maybe too early.. either ' +
            'way. This Master Aryon seems to have an affinity for the outputs of Dwemer ' +
            'Artificers. We have this in common.',
    },
];

// ---------------------------------------------------------------------------
// Generic topic overrides — Lillemare-specific responses
// ---------------------------------------------------------------------------
const GENERIC_TOPIC_OVERRIDES = [
    {
        id: 'LM_S_ALT',
        topic: 'Altmer',
        text:
            'Yes, yes, I am one. Or will be. We\'re a patient people, though I find patience ' +
            'difficult when the dead won\'t stop humming. Do you hear that? No, of course you don\'t.',
    },
    {
        id: 'LM_S_RUM',
        topic: 'latest rumors',
        text:
            'Rumors? I\'ve heard things that haven\'t happened yet and frankly I wish I hadn\'t. ' +
            'Ask someone with a more... linear perspective.',
    },
    {
        id: 'LM_S_ADV',
        topic: 'little advice',
        text:
            'Advice... don\'t eat the mushrooms near Tel Fyr. Or do. I can\'t remember if that\'s ' +
            'happened yet. Actually, forget I said anything. What were we discussing?',
    },
    {
        id: 'LM_S_SEC',
        topic: 'little secret',
        text:
            'I\'ve plenty of secrets but they\'re all from the wrong century. You wouldn\'t believe ' +
            'me, and honestly that\'s for the best.',
    },
    {
        id: 'LM_S_TRD',
        topic: 'my trade',
        text:
            'I study the resonance between time and magicka. Or rather, I will have studied it. ' +
            'It\'s complicated. The Leaf helps me think about it less, which is when I think about it best.',
    },
    {
        id: 'LM_S_SVC',
        topic: 'Services',
        text:
            'I can sell you incantations, or help you weave your own. It\'s the least I can do while ' +
            'I\'m... stuck here. Waiting. Listening to these insufferable ancestors drone on about the Tribunal.',
    },
    {
        id: 'LM_S_SIP',
        topic: 'someone in particular',
        text:
            'People come and go. Mostly go, in my experience. Sometimes before they\'ve arrived. ' +
            'I\'m not the one to ask about the locals, I barely know what era this is.',
    },
    {
        id: 'LM_S_SPL',
        topic: 'specific place',
        text:
            'Places are unreliable. I went looking for the Crystal Tower last week and it was exactly ' +
            'where it should be, which means I\'m far too early. Or too late. Bother.',
    },
];

// ---------------------------------------------------------------------------
// Binary helpers (same conventions as spreadable-corprus builder)
// ---------------------------------------------------------------------------

function subrecord(type, data) {
    const payload = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const header = Buffer.alloc(8);
    header.write(type, 0, 4, 'ascii');
    header.writeInt32LE(payload.length, 4);
    return Buffer.concat([header, payload]);
}

function record(type, subrecords) {
    const body = Buffer.concat(subrecords);
    const header = Buffer.alloc(16);
    header.write(type, 0, 4, 'ascii');
    header.writeInt32LE(body.length, 4);
    header.writeInt32LE(0, 8);
    header.writeInt32LE(0, 12);
    return Buffer.concat([header, body]);
}

function zstring(str) {
    return Buffer.from(`${str}\0`, 'utf8');
}

// ---------------------------------------------------------------------------
// TES3 header
// ---------------------------------------------------------------------------

function buildTes3Header(recordCount) {
    const hedr = Buffer.alloc(300);
    hedr.writeFloatLE(1.2, 0);
    hedr.writeInt32LE(1, 4);
    Buffer.from('Suppression Spells\0', 'ascii').copy(hedr, 8, 0, 32);
    Buffer.from('Lillemare NPC, quest dialogue, and journal entries\0', 'ascii').copy(hedr, 40, 0, 256);
    hedr.writeInt32LE(recordCount, 296);

    const masterSize = Buffer.alloc(8);
    masterSize.writeBigInt64LE(0n, 0);

    return record('TES3', [
        subrecord('HEDR', hedr),
        subrecord('MAST', zstring('Morrowind.esm')),
        subrecord('DATA', masterSize),
        subrecord('MAST', zstring('Bloodmoon.esm')),
        subrecord('DATA', masterSize),
    ]);
}

// ---------------------------------------------------------------------------
// ENCH record — Sound 100pts Constant Effect
// ---------------------------------------------------------------------------

function buildEnchRecord() {
    // ENDT: 16 bytes — type, cost, charge, flags
    const endt = Buffer.alloc(16);
    endt.writeInt32LE(3, 0);  // type 3 = Constant Effect
    endt.writeInt32LE(0, 4);  // cost (0 for CE)
    endt.writeInt32LE(0, 8);  // charge (0 for CE)
    endt.writeInt32LE(0, 12); // flags

    // ENAM: 24 bytes — one effect entry
    const enam = Buffer.alloc(24);
    enam.writeInt16LE(48, 0);   // effectId: Sound
    enam.writeInt8(-1, 2);      // skillId: N/A
    enam.writeInt8(-1, 3);      // attributeId: N/A
    enam.writeInt32LE(0, 4);    // range: Self
    enam.writeInt32LE(0, 8);    // area: 0
    enam.writeInt32LE(0, 12);   // duration: 0 (CE)
    enam.writeInt32LE(100, 16); // magnitudeMin
    enam.writeInt32LE(100, 20); // magnitudeMax

    return record('ENCH', [
        subrecord('NAME', zstring(CUSTOM_ENCH_ID)),
        subrecord('ENDT', endt),
        subrecord('ENAM', enam),
    ]);
}

// ---------------------------------------------------------------------------
// ARMO record — custom helm based on Gondolier's Helm
// ---------------------------------------------------------------------------

function buildCustomHelmRecord() {
    // AODT: 24 bytes — type, weight, value, health, enchantPts, armor
    const aodt = Buffer.alloc(24);
    aodt.writeInt32LE(0, 0);       // type: Helmet
    aodt.writeFloatLE(4.0, 4);     // weight
    aodt.writeInt32LE(10, 8);      // value
    aodt.writeInt32LE(100, 12);    // health
    aodt.writeInt32LE(100, 16);    // enchantment points
    aodt.writeInt32LE(1, 20);      // armor rating

    // INDX: body part index (1 byte)
    const indx = Buffer.alloc(1);
    indx.writeUInt8(1, 0); // 1 = Hair slot (helmet covers hair)

    return record('ARMO', [
        subrecord('NAME', zstring(CUSTOM_HELM_ID)),
        subrecord('MODL', zstring(CUSTOM_HELM_MODEL)),
        subrecord('FNAM', zstring(CUSTOM_HELM_NAME)),
        subrecord('AODT', aodt),
        subrecord('ITEX', zstring(CUSTOM_HELM_ICON)),
        subrecord('INDX', indx),
        subrecord('BNAM', zstring(CUSTOM_HELM_BODYPART)),
        subrecord('ENAM', zstring(CUSTOM_ENCH_ID)),
    ]);
}

// ---------------------------------------------------------------------------
// LIGH record — "Foresight" (buglamp, carried)
// ---------------------------------------------------------------------------

function buildCustomLightRecord() {
    // LHDT: 24 bytes — weight, value, time, radius, color RGBA, flags
    const lhdt = Buffer.alloc(24);
    lhdt.writeFloatLE(5.0, 0);     // weight (light_de_buglamp_01_64)
    lhdt.writeInt32LE(5000, 4);    // value
    lhdt.writeInt32LE(-1, 8);      // time (-1 = infinite, matches buglamp_01_64)
    lhdt.writeInt32LE(64, 12);      // radius (matches buglamp_01_64)
    lhdt.writeUInt8(160, 16);      // red (mysticism purple)
    lhdt.writeUInt8(80, 17);       // green
    lhdt.writeUInt8(255, 18);      // blue
    lhdt.writeUInt8(0, 19);        // alpha
    lhdt.writeInt32LE(0x0053, 20); // flags: Dynamic | Carry | Fire | FlickerSlow (buglamp_01_64)

    return record('LIGH', [
        subrecord('NAME', zstring(CUSTOM_LIGHT_ID)),
        subrecord('MODL', zstring(CUSTOM_LIGHT_MODEL)),
        subrecord('FNAM', zstring(CUSTOM_LIGHT_NAME)),
        subrecord('ITEX', zstring(CUSTOM_LIGHT_ICON)),
        subrecord('LHDT', lhdt),
    ]);
}


// ---------------------------------------------------------------------------
// NPC_ record — 52-byte explicit NPDT (required for vendor services)
// ---------------------------------------------------------------------------

function buildNpdt52() {
    const buf = Buffer.alloc(52);
    let o = 0;

    buf.writeInt16LE(NPC_LEVEL, o); o += 2;         // Level

    // Attributes — High Elf Sorcerer, Level 15
    buf.writeUInt8(35, o++);  // Strength
    buf.writeUInt8(75, o++);  // Intelligence
    buf.writeUInt8(60, o++);  // Willpower
    buf.writeUInt8(40, o++);  // Agility
    buf.writeUInt8(35, o++);  // Speed
    buf.writeUInt8(40, o++);  // Endurance
    buf.writeUInt8(45, o++);  // Personality
    buf.writeUInt8(40, o++);  // Luck

    // Skills (27, in engine order) — major/minor skills higher
    const skills = [
        5,   // Block
        5,   // Armorer
        20,  // Medium Armor (minor)
        20,  // Heavy Armor (minor)
        5,   // Blunt Weapon
        5,   // Long Blade
        5,   // Axe
        5,   // Spear
        20,  // Athletics (minor)
        55,  // Enchant (major)
        50,  // Destruction (major)
        45,  // Alteration (major)
        15,  // Illusion
        50,  // Conjuration (major)
        50,  // Mysticism (major)
        20,  // Restoration
        15,  // Alchemy
        10,  // Unarmored
        5,   // Security
        5,   // Sneak
        5,   // Acrobatics
        5,   // Light Armor
        20,  // Short Blade (minor)
        20,  // Marksman (minor)
        10,  // Mercantile
        10,  // Speechcraft
        5,   // Hand-to-hand
    ];
    for (const s of skills) buf.writeUInt8(s, o++);

    buf.writeUInt8(0, o++);                          // Reputation
    buf.writeInt16LE(90, o); o += 2;                 // Health
    buf.writeInt16LE(150, o); o += 2;                // Magicka
    buf.writeInt16LE(175, o); o += 2;                // Fatigue
    buf.writeUInt8(NPC_DISPOSITION, o++);             // Disposition
    buf.writeUInt8(0, o++);                          // Faction ID (none)
    buf.writeUInt8(0, o++);                          // Rank
    buf.writeUInt8(0, o++);                          // Unknown
    buf.writeInt32LE(NPC_GOLD, o);                   // Gold

    return buf;
}

function buildNpcRecord() {
    const subs = [
        subrecord('NAME', zstring(NPC_RECORD_ID)),
        subrecord('FNAM', zstring(NPC_NAME)),
        subrecord('RNAM', zstring(NPC_RACE)),
        subrecord('CNAM', zstring(NPC_CLASS)),
        subrecord('ANAM', zstring('')),
        subrecord('BNAM', zstring(NPC_HEAD)),
        subrecord('KNAM', zstring(NPC_HAIR)),
    ];

    subs.push(subrecord('NPDT', buildNpdt52()));

    // NPC flags: 0x0001 = female, 0x0008 = base (explicit stats, no auto-calc)
    let flags = 0x0008;
    if (NPC_FEMALE) flags |= 0x0001;
    const flagBuf = Buffer.alloc(4);
    flagBuf.writeInt32LE(flags, 0);
    subs.push(subrecord('FLAG', flagBuf));

    // AI data (AIDT): 12 bytes
    const aidt = Buffer.alloc(12);
    aidt.writeUInt8(30, 0); // hello
    aidt.writeUInt8(0, 1);  // unknown
    aidt.writeUInt8(0, 2);  // fight
    aidt.writeUInt8(0, 3);  // flee
    aidt.writeUInt8(0, 4);  // alarm
    // bytes 5-7: padding
    // bytes 8-11: services flags — 0x0800 = Spells, 0x8000 = Spellmaking
    aidt.writeInt32LE(0x8800, 8);
    subs.push(subrecord('AIDT', aidt));

    // AI_W (Wander) package — 14 bytes; stationary NPC with idle animations
    const aiw = Buffer.alloc(14);
    aiw.writeInt16LE(128, 0);  // distance (small wander radius)
    aiw.writeInt16LE(0, 2);    // duration
    aiw.writeUInt8(0, 4);      // timeOfDay
    aiw.writeUInt8(30, 5);     // idle1 (fidget)
    aiw.writeUInt8(20, 6);     // idle2 (look around)
    aiw.writeUInt8(10, 7);     // idle3
    // idle4-8 and unknown byte stay 0
    subs.push(subrecord('AI_W', aiw));

    // NPCS: spells this NPC sells (32-byte zero-padded IDs)
    for (const spellId of NPC_SELL_SPELLS) {
        const buf = Buffer.alloc(32);
        buf.write(spellId, 0, 'ascii');
        subs.push(subrecord('NPCS', buf));
    }

    // NPCO: inventory items (36 bytes each — int32 count + 32-byte item ID)
    for (const itemId of NPC_INVENTORY) {
        const buf = Buffer.alloc(36);
        buf.writeInt32LE(1, 0);
        buf.write(itemId, 4, 'ascii');
        subs.push(subrecord('NPCO', buf));
    }

    return record('NPC_', subs);
}

// ---------------------------------------------------------------------------
// CELL record — place the NPC in an interior cell
// ---------------------------------------------------------------------------

function buildCellRecord() {
    const subs = [];

    // Cell name
    subs.push(subrecord('NAME', zstring(CELL_NAME)));

    // Cell DATA: flags + grid X/Y (grid unused for interiors)
    const cellData = Buffer.alloc(12);
    cellData.writeInt32LE(0x01, 0); // 0x01 = Interior
    subs.push(subrecord('DATA', cellData));

    // NAM0 separates persistent refs (before) from temporary refs (after).
    // Our NPC is a temporary ref, so NAM0 must precede it.
    const nam0 = Buffer.alloc(4);
    nam0.writeInt32LE(1, 0); // 1 temporary reference follows
    subs.push(subrecord('NAM0', nam0));

    // Object reference: FRMR (ref number), NAME (object ID), DATA (position/rotation)
    const frmr = Buffer.alloc(4);
    frmr.writeInt32LE(1, 0);
    subs.push(subrecord('FRMR', frmr));

    subs.push(subrecord('NAME', zstring(NPC_RECORD_ID)));

    // Position: X, Y, Z (float32 each), Rotation: X, Y, Z (float32 each) = 24 bytes
    const posData = Buffer.alloc(24);
    posData.writeFloatLE(NPC_POS_X, 0);
    posData.writeFloatLE(NPC_POS_Y, 4);
    posData.writeFloatLE(NPC_POS_Z, 8);
    posData.writeFloatLE(NPC_ROT_X, 12);
    posData.writeFloatLE(NPC_ROT_Y, 16);
    posData.writeFloatLE(NPC_ROT_Z, 20);
    subs.push(subrecord('DATA', posData));

    return record('CELL', subs);
}

// ---------------------------------------------------------------------------
// Journal DIAL + INFO records
// ---------------------------------------------------------------------------

function buildJournalInfoData(stage) {
    const buf = Buffer.alloc(12);
    buf.writeUInt8(4, 0);      // disposition / type: journal
    buf.writeInt32LE(stage, 4);
    buf.writeInt8(-1, 8);
    buf.writeInt8(-1, 9);
    buf.writeInt8(-1, 10);
    buf.writeUInt8(0, 11);
    return buf;
}

function buildJournalDial() {
    const data = Buffer.from([4]); // type 4 = journal
    return record('DIAL', [subrecord('NAME', zstring(JOURNAL_ID)), subrecord('DATA', data)]);
}

function buildJournalInfo(stage, text) {
    const infoId = `LM_J_${stage}`;
    return record('INFO', [
        subrecord('INAM', zstring(infoId)),
        subrecord('PNAM', zstring('')),
        subrecord('NNAM', zstring('')),
        subrecord('DATA', buildJournalInfoData(stage)),
        subrecord('NAME', zstring(text)),
        subrecord('QSTN', Buffer.from([1])),
    ]);
}

// ---------------------------------------------------------------------------
// Greeting DIAL + INFO records
// ---------------------------------------------------------------------------

function buildGreetingDial() {
    const data = Buffer.from([2]); // type 2 = greeting
    return record('DIAL', [
        subrecord('NAME', zstring(GREETING_DIAL_ID)),
        subrecord('DATA', data),
    ]);
}

function buildGreetingInfoData() {
    const buf = Buffer.alloc(12);
    // bytes 0-3: dialogue type (0 for non-journal)
    // bytes 4-7: disposition (0 = no requirement)
    buf.writeInt8(-1, 8);     // rank: any
    buf.writeInt8(-1, 9);     // gender: any
    buf.writeInt8(-1, 10);    // PC rank: any
    return buf;
}

function buildScvr(conditionIndex, condition) {
    const idx = String(conditionIndex);
    const intv = Buffer.alloc(4);

    if (condition.type === 'choice') {
        const fn = String(FUNCTION_CHOICE).padStart(2, '0');
        intv.writeInt32LE(condition.value, 0);
        return {
            scvr: Buffer.from(`${idx}1${fn}0`, 'ascii'),
            intv,
        };
    }
    if (condition.type === 'journal') {
        const journalId = condition.journalId ?? JOURNAL_ID;
        intv.writeInt32LE(condition.value, 0);
        return {
            scvr: Buffer.from(`${idx}4JX3${journalId}`, 'ascii'),
            intv,
        };
    }
    if (condition.type === 'item') {
        intv.writeInt32LE(condition.count, 0);
        return {
            scvr: Buffer.from(`${idx}5IX3${condition.itemId}`, 'ascii'),
            intv,
        };
    }
    throw new Error(`unknown condition type: ${condition.type}`);
}

function buildGreetingInfo(info, prevId, nextId) {
    const subs = [
        subrecord('INAM', zstring(info.id)),
        subrecord('PNAM', zstring(prevId)),
        subrecord('NNAM', zstring(nextId)),
        subrecord('DATA', buildGreetingInfoData()),
        subrecord('ONAM', zstring(NPC_RECORD_ID)),
        subrecord('NAME', zstring(info.text)),
    ];

    for (let i = 0; i < info.conditions.length; i++) {
        const { scvr, intv } = buildScvr(i, info.conditions[i]);
        subs.push(subrecord('SCVR', scvr));
        subs.push(subrecord('INTV', intv));
    }

    if (info.resultScript) {
        subs.push(subrecord('BNAM', zstring(info.resultScript)));
    }

    return record('INFO', subs);
}

// ---------------------------------------------------------------------------
// Topic DIAL + INFO records (NPC-specific topics)
// ---------------------------------------------------------------------------

function buildTopicDial(topicName) {
    const data = Buffer.from([0]); // type 0 = regular topic
    return record('DIAL', [subrecord('NAME', zstring(topicName)), subrecord('DATA', data)]);
}

function buildTopicInfo(topic) {
    return record('INFO', [
        subrecord('INAM', zstring(topic.id)),
        subrecord('PNAM', zstring('')),
        subrecord('NNAM', zstring('')),
        subrecord('DATA', buildGreetingInfoData()),
        subrecord('ONAM', zstring(NPC_RECORD_ID)),
        subrecord('NAME', zstring(topic.text)),
    ]);
}

// ---------------------------------------------------------------------------
// Assemble plugin
// ---------------------------------------------------------------------------

const JOURNAL_INFO_COUNT = 2;
const GREETING_INFO_COUNT = GREETING_INFOS.length;
const TOPIC_RECORD_COUNT = NPC_TOPICS.length * 2;       // 1 DIAL + 1 INFO each
const GENERIC_OVERRIDE_COUNT = GENERIC_TOPIC_OVERRIDES.length * 2; // 1 DIAL + 1 INFO each
// +1 ENCH (helm), +1 ARMO (helm), +1 LIGH (foresight)
const CONTENT_RECORDS = 1 + 1 + 1 + 1 + 1 + 1 + JOURNAL_INFO_COUNT + 1 + GREETING_INFO_COUNT + TOPIC_RECORD_COUNT + GENERIC_OVERRIDE_COUNT;

const records = [buildTes3Header(CONTENT_RECORDS)];

records.push(buildEnchRecord());
records.push(buildCustomHelmRecord());
records.push(buildCustomLightRecord());
records.push(buildNpcRecord());
records.push(buildCellRecord());

records.push(buildJournalDial());
records.push(buildJournalInfo(JOURNAL_FIRST_MEET_STAGE, JOURNAL_FIRST_MEET_TEXT));
records.push(buildJournalInfo(JOURNAL_COMPLETE_STAGE, JOURNAL_COMPLETE_TEXT));

records.push(buildGreetingDial());

for (let i = 0; i < GREETING_INFOS.length; i++) {
    const prevId = i > 0 ? GREETING_INFOS[i - 1].id : '';
    const nextId = i < GREETING_INFOS.length - 1 ? GREETING_INFOS[i + 1].id : '';
    records.push(buildGreetingInfo(GREETING_INFOS[i], prevId, nextId));
}

for (const topic of NPC_TOPICS) {
    records.push(buildTopicDial(topic.topic));
    records.push(buildTopicInfo(topic));
}

for (const override of GENERIC_TOPIC_OVERRIDES) {
    records.push(buildTopicDial(override.topic));
    records.push(buildTopicInfo(override));
}

const plugin = Buffer.concat(records);
writeFileSync(OUT, plugin);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const text = plugin.toString('binary');
const requiredStrings = [
    [NPC_RECORD_ID, 'NPC record ID'],
    [NPC_NAME, 'NPC display name'],
    [NPC_RACE, 'NPC race'],
    [NPC_CLASS, 'NPC class'],
    [CELL_NAME, 'Cell name'],
    [JOURNAL_ID, 'Journal ID'],
    [GREETING_DIAL_ID, 'Greeting dialogue ID'],
    ['Goodbye', 'Goodbye result script'],
    ['Hackle-Lo Leaf', 'Hackle-Lo Leaf in greeting text'],
    ['Choice "Get it yourself', 'Refuse choice BNAM'],
    ['Choice "Not yet', 'Return choice BNAM'],
    ['RemoveItem', 'RemoveItem result script'],
    [`04JX3${JOURNAL_ID}`, 'lm_quest journal SCVR'],
    ...NPC_TOPICS.map((t) => [t.topic, `Topic: ${t.topic}`]),
    ...GENERIC_TOPIC_OVERRIDES.map((t) => [t.topic, `Override: ${t.topic}`]),
    [CUSTOM_HELM_ID, 'Custom helm record ID'],
    [CUSTOM_HELM_NAME, 'Custom helm display name'],
    [CUSTOM_ENCH_ID, 'Custom helm enchantment ID'],
    [CUSTOM_LIGHT_ID, 'Custom light record ID'],
    [CUSTOM_LIGHT_NAME, 'Custom light display name'],
];

for (const [needle, label] of requiredStrings) {
    if (!text.includes(needle)) {
        console.error(`validation failed: missing ${label} (${needle})`);
        process.exit(1);
    }
}

// Validate DIAL DATA subrecords are 1 byte
let pos = 0;
while (pos < plugin.length - 16) {
    const recType = plugin.toString('ascii', pos, pos + 4);
    const recSize = plugin.readInt32LE(pos + 4);
    if (recSize < 0 || recSize > 100000) break;
    if (recType === 'DIAL') {
        let sub = pos + 16;
        const end = sub + recSize;
        while (sub < end) {
            const subType = plugin.toString('ascii', sub, sub + 4);
            const subSize = plugin.readInt32LE(sub + 4);
            if (subType === 'DATA' && subSize !== 1) {
                console.error('validation failed: DIAL DATA is not 1 byte');
                process.exit(1);
            }
            sub += 8 + subSize;
        }
    }
    pos += 16 + recSize;
}

console.log(`Wrote ${OUT} (${plugin.length} bytes, ${CONTENT_RECORDS} content records)`);
