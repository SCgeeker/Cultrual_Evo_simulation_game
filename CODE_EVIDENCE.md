# Code Evidence: Evolutionary Era Unlock Logic Verification

## File: app.js
**Location**: D:\TCU\Lecture\Cultural_evolution\cost-of-culture-game\app.js

---

## Evidence 1: Fire Control evoRequires Definition

**Location**: Lines 76-96

```javascript
fire_control: {
    id: 'fire_control',
    name: '火的控制',
    path: 'digestion',
    tier: 1,
    cost: 3,
    ccsValue: 1,
    evoEra: 2,                          // 150萬年前 - 直立人用火
    evoYear: 1500000,
    evoRequires: ['stone_tools'],       // ← CROSS-PATH EVOLUTION LOCK
    icon: '🔥',
    effects: {
        digestionReduction: 0.20,
        brainBonus: 0.10
    },
    ...
}
```

**Key Point**: `evoRequires: ['stone_tools']` enforces that fire control cannot be unlocked without stone tools, creating a cross-path evolution dependency.

---

## Evidence 2: The isAvailable() Function

**Location**: Lines 862-908

```javascript
// 檢查基礎可用性 (前置條件)
isAvailable(player, techId) {
    const tech = TECH_CARDS[techId];
    if (!tech) return false;
    if (this.hasTech(player, techId)) return false;

    // Check 1: In-path requirements
    if (tech.requires) {
        if (tech.requiresAny) {
            if (!tech.requires.some(reqId => this.hasTech(player, reqId)))
                return false;
        } else {
            if (!tech.requires.every(reqId => this.hasTech(player, reqId)))
                return false;
        }
    }

    // Check 2: evoRequires (Cross-path evolution dependencies)
    if (tech.evoRequires) {
        if (!tech.evoRequires.every(reqId => this.hasTech(player, reqId)))
            return false;  // ← LINE 877: evoRequires enforced
    }

    // Check 3: General era ordering rule
    // 檢查演化時代順序：解鎖 era N 的技術需至少擁有一個 era N-1 的技術
    if (tech.evoEra && tech.evoEra > 1) {
        const prevEra = tech.evoEra - 1;
        const allUnlocked = [
            ...player.unlockedTechs,
            ...(tempState.unlockedThisTurn || [])
        ];
        const hasPrevEraTech = allUnlocked.some(id => {
            const t = TECH_CARDS[id];
            return t && t.evoEra === prevEra;
        });
        if (!hasPrevEraTech) return false;  // ← LINE 891: Era rule enforced
    }

    // Check 4: Tier 4 count requirement (for Tier 5)
    if (tech.requiresTier4Count) {
        const allUnlocked = [
            ...player.unlockedTechs,
            ...(tempState.unlockedThisTurn || [])
        ];
        const t4Count = allUnlocked.filter(id => {
            const t = TECH_CARDS[id];
            return t && t.tier === 4;
        }).length;
        if (t4Count < tech.requiresTier4Count) return false;
    }

    return true;
}
```

**Key Points**:
1. **Lines 876-878**: evoRequires check - Validates cross-path evolution dependencies
2. **Lines 881-892**: General era ordering rule - Validates that era N requires ≥1 era N-1 tech
3. **Lines 895-905**: Tier 4 count check - Validates endgame progression
4. **All checks are sequential** - Must pass all to unlock

---

## Evidence 3: Artifacts Convergence Point

**Location**: Lines 134-152

```javascript
artifacts: {
    id: 'artifacts',
    name: '人造物系統',
    path: 'digestion', // 也屬於 tools 路徑的終點
    tier: 4,
    cost: 12,
    ccsValue: 5,
    evoEra: 6,                    // 5萬年前 - 建築與器具
    evoYear: 40000,
    requires: ['food_preservation', 'complex_tools'],  // ← BOTH REQUIRED
    // requiresAny 移除，預設為 requiresAll
    icon: '🏛️',
    effects: {
        passiveEnergy: 3,
        muscleReduction: 1.0
    },
    ...
}
```

**Key Point**:
- `requires: ['food_preservation', 'complex_tools']` with no `requiresAny` flag
- This means **ALL** requirements must be met (lines 871 enforces this)
- food_preservation is Era 6 from digestion path
- complex_tools is Era 5 from tools path
- Creates forced cross-path convergence

---

## Evidence 4: Stone Tools (Era 1 Foundation)

**Location**: Lines 155-170

```javascript
stone_tools: {
    id: 'stone_tools',
    name: '石器製作',
    path: 'tools',
    tier: 1,
    cost: 3,
    ccsValue: 1,
    evoEra: 1,                    // 260萬年前 - 奧杜威石器（最早的技術）
    evoYear: 2600000,
    icon: '🪨',
    effects: {
        freeMuscleInvestment: 1
    },
    description: '最早的技術：將石頭變成延伸的手臂',
    flavorText: '奧杜威石器，250萬年前的發明，至今仍影響著我們。'
}
```

**Key Point**:
- No `requires` or `evoRequires`
- Only tech in Era 1, so no prior era to block it
- All Era 2 techs depend on either this or gathering_knowledge

---

## Evidence 5: Language (Era 3 Cross-Path Entry)

**Location**: Lines 208-223

```javascript
language: {
    id: 'language',
    name: '語言 Lv.1',
    path: 'social',
    tier: 1,
    cost: 2,
    ccsValue: 1,
    evoEra: 3,                    // 50-30萬年前 - 原語言能力
    evoYear: 300000,
    icon: '💬',
    effects: {
        canViewInvestment: 1
    },
    description: '符號與聲音的組合，開啟資訊傳遞的新紀元',
    flavorText: '語言讓我們能夠分享不在眼前的事物——過去、未來、想像。'
}
```

**Key Point**:
- No `requires` or `evoRequires`
- evoEra: 3 means lines 881-892 will require ≥1 Era 2 tech
- Era 2 contains: gathering_knowledge, fire_control
- Cannot skip Era 2

---

## Evidence 6: Gathering Knowledge (Era 2 Entry)

**Location**: Lines 296-311

```javascript
gathering_knowledge: {
    id: 'gathering_knowledge',
    name: '採集知識',
    path: 'environment',
    tier: 1,
    cost: 2,
    ccsValue: 1,
    evoEra: 2,                    // 150萬年前 - 早期採集知識
    evoYear: 1000000,
    icon: '🌱',
    effects: {
        gutsBonus: 0.20
    },
    description: '認識可食用的植物、果實、根莖',
    flavorText: '哪些蘑菇能吃？這個知識可能救你一命，或要你一命。'
}
```

**Key Point**:
- No `requires` or `evoRequires`
- evoEra: 2 means lines 881-892 will require ≥1 Era 1 tech
- Era 1 ONLY contains: stone_tools
- Cannot unlock gathering_knowledge without stone_tools

---

## Evidence 7: Cumulative Culture (Tier 5 Endgame)

**Location**: Lines 369-386

```javascript
cumulative_culture: {
    id: 'cumulative_culture',
    name: '累積文化',
    path: 'social', // 同時出現在 social 和 environment
    tier: 5,
    cost: 15,
    ccsValue: 10,
    evoEra: 7,                    // 1萬年前至今 - 累積文化的棘輪效應
    evoYear: 5000,
    requiresTier4Count: 2,         // ← REQUIRES 2 TIER 4 TECHS
    icon: '🚀',
    effects: {
        ccsPerTech: true           // 特殊效果：每個已解鎖技術 +1 CCS
    },
    description: '文化的棘輪效應，知識的指數級成長',
    flavorText: '從此刻起，我們不再是適應這顆星球，而是開始邁向星辰。'
}
```

**Key Point**:
- Unique requirement: `requiresTier4Count: 2`
- Lines 895-905 enforce this check
- Tier 4 techs available: artifacts, teaching_system, information_resources
- Must unlock any 2 of these 3 before cumulative_culture

---

## Evidence 8: Tier 4 Count Check Implementation

**Location**: Lines 895-905

```javascript
// 檢查 Tier 4 技術數量需求 (Tier 5)
if (tech.requiresTier4Count) {
    const allUnlocked = [
        ...player.unlockedTechs,
        ...(tempState.unlockedThisTurn || [])
    ];
    const t4Count = allUnlocked.filter(id => {
        const t = TECH_CARDS[id];
        return t && t.tier === 4;
    }).length;
    if (t4Count < tech.requiresTier4Count) return false;
}
```

**Key Points**:
1. Counts existing tier 4 techs
2. Includes both permanent unlocks and provisional unlocks in current turn
3. Blocks if count is less than required
4. Only cumulative_culture uses this (requiresTier4Count: 2)

---

## Evidence 9: hasTech() Function

**Location**: Lines 990-994

```javascript
// 檢查玩家是否擁有特定技術
hasTech(player, techId) {
    const permanent = player.unlockedTechs.includes(techId);
    const pending = tempState.unlockedThisTurn &&
                    tempState.unlockedThisTurn.includes(techId);
    return permanent || !!pending;
}
```

**Key Point**:
- Checks both permanent unlocks AND provisional unlocks
- This is why lines 884-886 in isAvailable() combine both arrays:
  ```javascript
  const allUnlocked = [
      ...player.unlockedTechs,
      ...(tempState.unlockedThisTurn || [])
  ];
  ```

---

## Evidence 10: EVO_ERAS Definition

**Location**: Lines 63-71

```javascript
// === 演化時代定義 ===
const EVO_ERAS = {
    1: { name: '舊石器時代早期', period: '260-150萬年前', icon: '🦴' },
    2: { name: '舊石器時代中期', period: '150-50萬年前', icon: '🔥' },
    3: { name: '認知革命', period: '50-30萬年前', icon: '🧠' },
    4: { name: '行為現代性', period: '30-10萬年前', icon: '🎨' },
    5: { name: '舊石器晚期', period: '10-5萬年前', icon: '⚒️' },
    6: { name: '文明曙光', period: '5萬-1萬年前', icon: '🏛️' },
    7: { name: '新石器革命', period: '1萬年前至今', icon: '🚀' }
};
```

**Key Point**:
- Defines the 7 eras used for era numbering in evoEra fields
- Enforces realistic historical progression from 260 million years ago

---

## Summary of Protection Layers

| Protection | Code Location | Enforces |
|------------|---------------|----------|
| evoRequires Check | Lines 876-878 | Cross-path evolution dependencies |
| Era Ordering Rule | Lines 881-892 | General progression (Era N needs Era N-1) |
| In-path Requires | Lines 867-873 | Path-specific progression (requiresAll/requiresAny) |
| Tier 4 Count | Lines 895-905 | Endgame tier progression |
| hasTech() | Lines 990-994 | Includes provisional unlocks in progression |

---

## Verification Results

✅ **isAvailable() enforces ALL protections**
✅ **General era rule prevents all era-skipping**
✅ **evoRequires adds cross-path constraints**
✅ **fire_control is double-protected**
✅ **artifacts forces path convergence**
✅ **cumulative_culture requires tier 4 convergence**

**Conclusion**: No bypass possible. Evolutionary era unlock logic is correct.
