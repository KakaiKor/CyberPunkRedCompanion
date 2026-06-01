export class DistanceCalculator {
    constructor() {
        const distTable = { pistol: [13, 15, 20, 25, 30, 30, null, null], smg: [15, 13, 15, 20, 25, 25, 30, null], shotgun: [13, 15, 20, 25, 30, 35, null, null], rifle: [17, 16, 15, 13, 15, 20, 25, 30], sniper: [30, 25, 25, 20, 15, 16, 17, 20] };
        const ranges = [{ min: 0, max: 6, label: "0-6 м" }, { min: 7, max: 12, label: "7-12 м" }, { min: 13, max: 25, label: "13-25 м" }, { min: 26, max: 50, label: "26-50 м" }, { min: 51, max: 100, label: "51-100 м" }, { min: 101, max: 200, label: "101-200 м" }, { min: 201, max: 400, label: "201-400 м" }, { min: 401, max: 800, label: "401-800 м" }];
        const weaponSelect = document.getElementById('weaponDistanceSelect');
        const slider = document.getElementById('distanceSlider');
        const update = () => {
            const weapon = weaponSelect.value;
            const dist = parseInt(slider.value);
            document.getElementById('distanceValue').innerText = dist;
            const row = distTable[weapon];
            let sl = null;
            for (let i = 0; i < ranges.length; i++) if (dist >= ranges[i].min && dist <= ranges[i].max) { sl = row[i]; break; }
            document.getElementById('slValue').textContent = (sl !== null && sl !== undefined) ? sl : "вне дальности";
            let bestIdx = -1, minSL = Infinity;
            for (let i = 0; i < row.length; i++) if (row[i] !== null && row[i] < minSL) { minSL = row[i]; bestIdx = i; }
            const goldenDiv = document.getElementById('goldenZone');
            const goldenInfo = document.getElementById('goldenZoneInfo');
            if (bestIdx !== -1 && goldenDiv) {
                const left = (ranges[bestIdx].min / 800) * 100;
                const right = (ranges[bestIdx].max / 800) * 100;
                goldenDiv.style.left = `${left}%`;
                goldenDiv.style.width = `${right - left}%`;
                goldenDiv.style.display = 'block';
                goldenInfo.innerHTML = `✨ Золотая зона: ${ranges[bestIdx].label} (СЛ = ${minSL})`;
            } else if (goldenDiv) goldenDiv.style.display = 'none';
        };
        weaponSelect.addEventListener('change', update);
        slider.addEventListener('input', update);
        update();
    }
}