/**
 * Randomizer Module
 * Основной модуль для веб-приложения-рандомайзера
 */

class Randomizer {
    constructor() {
        this.variants = [
            { id: 1, text: 'Вариант 1', color: '#FF6B6B', icon: '🎯', chance: 20 },
            { id: 2, text: 'Вариант 2', color: '#4ECDC4', icon: '⭐', chance: 20 },
            { id: 3, text: 'Вариант 3', color: '#FFE66D', icon: '🎁', chance: 20 },
            { id: 4, text: 'Вариант 4', color: '#95E1D3', icon: '🚀', chance: 20 },
            { id: 5, text: 'Вариант 5', color: '#C7CEEA', icon: '💎', chance: 20 }
        ];

        this.currentMode = 'wheel'; // wheel, roulette, barrel, list
        this.isSpinning = false;
        this.spinSpeed = 50; // 10-100
        this.result = null;
        this.spinDuration = 4000; // ms
        this.currentRotation = 0;

        this.loadSettings();
        this.initElements();
        this.setupEventListeners();
        this.render();
    }

    // ===== LOAD/SAVE =====

    loadSettings() {
        const saved = localStorage.getItem('randomizerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.variants) this.variants = data.variants;
            if (data.currentMode) this.currentMode = data.currentMode;
            if (data.spinSpeed) this.spinSpeed = data.spinSpeed;
        }
    }

    saveSettings() {
        localStorage.setItem('randomizerData', JSON.stringify({
            variants: this.variants,
            currentMode: this.currentMode,
            spinSpeed: this.spinSpeed
        }));
    }

    // ===== INITIALIZATION =====

    initElements() {
        this.container = document.querySelector('.randomizer-container');
        this.modeSelect = document.querySelector('.mode-select');
        this.speedInput = document.querySelector('.speed-input');
        this.speedValue = document.querySelector('.speed-value');
        this.spinnerArea = document.querySelector('.randomizer-spinner');
        this.settingsPanel = document.querySelector('.randomizer-settings');
        this.resultArea = document.querySelector('.randomizer-result');
        this.spinBtn = document.querySelector('.spin-btn');
        this.variantsList = document.querySelector('.variants-list');
        this.addVariantBtn = document.querySelector('.add-variant-btn');
        this.settingsToggle = document.querySelector('.settings-toggle');
    }

    setupEventListeners() {
        if (this.modeSelect) this.modeSelect.addEventListener('change', (e) => this.setMode(e.target.value));
        if (this.speedInput) this.speedInput.addEventListener('input', (e) => this.setSpeed(parseInt(e.target.value)));
        if (this.settingsToggle) {
            this.settingsToggle.addEventListener('click', () => {
                this.settingsPanel.classList.toggle('hidden');
                this.spinnerArea.classList.toggle('hidden');
            });
        }
    }

    // ===== MODE MANAGEMENT =====

    setMode(mode) {
        this.currentMode = mode;
        this.saveSettings();
        this.render();
    }

    setSpeed(speed) {
        this.spinSpeed = speed;
        this.saveSettings();
        if (this.speedValue) this.speedValue.textContent = speed;
    }

    // ===== VARIANT MANAGEMENT =====

    addVariant() {
        const newId = Math.max(...this.variants.map(v => v.id), 0) + 1;
        this.variants.push({
            id: newId,
            text: `Вариант ${this.variants.length + 1}`,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            icon: '✨',
            chance: 20
        });
        this.saveSettings();
        this.renderSettings();
    }

    deleteVariant(id) {
        if (this.variants.length > 2) {
            this.variants = this.variants.filter(v => v.id !== id);
            this.saveSettings();
            this.renderSettings();
        } else {
            this.showToast('Нужно минимум 2 варианта!', 'error');
        }
    }

    updateVariant(id, field, value) {
        const variant = this.variants.find(v => v.id === id);
        if (variant) {
            variant[field] = field === 'chance' ? parseInt(value) || 0 : value;
            this.saveSettings();
            this.renderSettings();
        }
    }

    // ===== SPINNING LOGIC =====

    async spin() {
        if (this.isSpinning || this.variants.length < 2) return;

        this.isSpinning = true;
        
        // Получаем кнопку динамически
        const spinBtn = this.spinnerArea.querySelector('.spin-btn');
        if (spinBtn) spinBtn.disabled = true;
        
        this.resultArea.classList.add('hidden');

        const selectedVariant = this.selectRandomVariant();
        // Увеличиваем время анимации: минимум 2 сек, максимум 5 сек
        const spinTime = 2000 + (this.spinSpeed / 100) * 3000; // 2000-5000ms

        switch (this.currentMode) {
            case 'wheel':
                await this.spinWheel(selectedVariant, spinTime);
                break;
            case 'roulette':
                await this.spinRoulette(selectedVariant, spinTime);
                break;
            case 'barrel':
                await this.spinBarrel(selectedVariant, spinTime);
                break;
            case 'list':
                await this.spinList(selectedVariant, spinTime);
                break;
        }

        this.result = selectedVariant;
        this.showResult();
        this.isSpinning = false;
        
        // Включаем кнопку обратно
        const spinBtnEl = this.spinnerArea.querySelector('.spin-btn');
        if (spinBtnEl) spinBtnEl.disabled = false;
    }

    selectRandomVariant() {
        const totalChance = this.variants.reduce((sum, v) => sum + v.chance, 0);
        let random = Math.random() * totalChance;

        for (let variant of this.variants) {
            random -= variant.chance;
            if (random <= 0) return variant;
        }

        return this.variants[0];
    }

// ===== WHEEL SPINNING (Исправлено) =====
async spinWheel(target, duration) {
    const wheelEl = this.spinnerArea.querySelector('canvas');
    if (!wheelEl) return;

    const targetIndex = this.variants.indexOf(target);
    const segmentAngle = 360 / this.variants.length;

    // 1. Текущая позиция (где колесо сейчас фактически)
    const startRotation = this.currentRotation;

    // 2. Рассчитываем "нулевую точку" нужного сегмента.
    // Мы хотим, чтобы сегмент оказался под стрелкой (вверху).
    // Поворот колеса по часовой, поэтому вычитаем угол сегмента из 360.
    const targetBaseAngle = (360 - (targetIndex * segmentAngle)) % 360;

    // 3. Добавляем случайное смещение ВНУТРИ сегмента (от 10% до 90% ширины)
    const randomOffset = (segmentAngle * 0.1) + (Math.random() * (segmentAngle * 0.8));
    const finalAnglePosition = (targetBaseAngle - randomOffset + 360) % 360;

    // 4. Считаем ОБЩИЙ ПУТЬ. 
    // Нам нужно прокрутить минимум N оборотов + доехать до нужной позиции.
    const minimumSpins = (5 + Math.floor(this.spinSpeed / 20)) * 360;
    
    // Вычисляем, сколько градусов нужно добавить к ТЕКУЩЕМУ углу, 
    // чтобы остаток от деления на 360 стал равен finalAnglePosition
    const currentAnglePos = startRotation % 360;
    let extraDegrees = finalAnglePosition - currentAnglePos;
    if (extraDegrees < 0) extraDegrees += 360; // Всегда крутим только вперед

    const finalRotation = startRotation + minimumSpins + extraDegrees;

    const startTime = performance.now();

    return new Promise(resolve => {
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Используем "Ease Out Quart" для сверхплавного замедления в конце
            // f(t) = 1 – (1 – t)^4
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = startRotation + (finalRotation - startRotation) * ease;

            wheelEl.style.transform = `rotate(${current}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentRotation = finalRotation; // Сохраняем финальную точку
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}

// ===== ROULETTE / BARREL (Общая логика замедления) =====
async spinRoulette(target, duration) {
    const columns = document.querySelectorAll('.roulette-column');
    if (columns.length === 0) return;

    const startTime = performance.now();
    const totalSteps = 50 + (this.spinSpeed / 2); // Сколько раз сменится подсветка

    return new Promise(resolve => {
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Замедляющийся темп
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentStep = Math.floor(ease * totalSteps);

            columns.forEach((column, idx) => {
                const items = column.querySelectorAll('.roulette-item');
                items.forEach(item => item.classList.remove('highlight'));
                
                // В конце фиксируем на таргете, до этого — рандом
                let displayIdx;
                if (progress === 1) {
                    displayIdx = this.variants.indexOf(target);
                } else {
                    displayIdx = (currentStep + idx) % items.length;
                }
                
                if (items[displayIdx]) items[displayIdx].classList.add('highlight');
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}

    // ===== LIST SPINNING =====

    async spinList(target, duration) {
        const listItems = document.querySelectorAll('.list-spinner-item');
        if (listItems.length === 0) return;

        const startTime = Date.now();
        let currentIndex = 0;

        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                    const speed = Math.max(1, Math.floor(50 * (1 - progress))); // Decelerate
                    currentIndex = (currentIndex + speed) % this.variants.length;

                    listItems.forEach((item, idx) => {
                        item.classList.remove('spinning', 'highlight');
                        if (idx === currentIndex) {
                            item.classList.add('spinning', 'highlight');
                        }
                    });

                    requestAnimationFrame(animate);
                } else {
                    listItems.forEach(item => item.classList.remove('spinning'));
                    const targetItem = Array.from(listItems).find(item => 
                        item.textContent.includes(target.text)
                    );
                    if (targetItem) targetItem.classList.add('highlight');

                    resolve();
                }
            };

            animate();
        });
    }

    // ===== RESULT DISPLAY =====

    showResult() {
        if (!this.result) return;

        const resultValue = this.resultArea.querySelector('.result-value');
        const resultIcon = this.resultArea.querySelector('.result-icon');
        const shareBtn = this.resultArea.querySelector('.share-btn');

        if (resultValue) resultValue.textContent = this.result.text;
        if (resultIcon) resultIcon.textContent = this.result.icon;
        if (resultValue) resultValue.style.color = this.result.color;

        this.resultArea.classList.remove('hidden');

        if (shareBtn) {
            shareBtn.onclick = () => this.shareResult();
        }
    }

    shareResult() {
        if (!this.result) return;

        const text = `🎲 Я получил: ${this.result.icon} ${this.result.text}!\n\nПроверь и ты: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'Randomizer',
                text: text
            }).catch(err => console.log('Ошибка при поделении:', err));
        } else {
            // Fallback для копирования в буфер обмена
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Результат скопирован в буфер обмена!', 'success');
            }).catch(() => {
                alert(text);
            });
        }
    }

    // ===== RENDERING =====

    render() {
        this.renderSpinner();
        this.renderSettings();
        this.updateControls();
    }

    renderSpinner() {
        if (!this.spinnerArea) return;

        let html = '';

        switch (this.currentMode) {
            case 'wheel':
                html = this.renderWheel();
                break;
            case 'roulette':
                html = this.renderRoulette();
                break;
            case 'barrel':
                html = this.renderBarrel();
                break;
            case 'list':
                html = this.renderList();
                break;
        }

        this.spinnerArea.innerHTML = html;
        
        // Переприцепляем обработчик для кнопки
        const spinBtn = this.spinnerArea.querySelector('.spin-btn');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spin());
        }
        
        // Если это колесо, нужно нарисовать canvas
        if (this.currentMode === 'wheel') {
            this.drawWheel();
        }
    }

    drawWheel() {
        let canvas = this.spinnerArea.querySelector('canvas');
        if (!canvas) {
            const container = this.spinnerArea.querySelector('.wheel-container div:last-child');
            canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            canvas.className = 'wheel';
            container.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        const segmentAngle = 360 / this.variants.length;

        // Очищаем canvas
        ctx.clearRect(0, 0, 300, 300);

        // Рисуем сегменты
        for (let i = 0; i < this.variants.length; i++) {
            const variant = this.variants[i];
            // Сдвигаем на -90 градусов так чтобы первый сегмент был сверху
            const startAngle = ((i * segmentAngle) - 90) * Math.PI / 180;
            const endAngle = (((i + 1) * segmentAngle) - 90) * Math.PI / 180;

            // Сегмент
            ctx.beginPath();
            ctx.moveTo(150, 150);
            ctx.arc(150, 150, 140, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = variant.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Текст
            const textAngle = (startAngle + endAngle) / 2;
            const textX = 150 + Math.cos(textAngle) * 95;
            const textY = 150 + Math.sin(textAngle) * 95;

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.fillText(variant.text, 0, 10);
            ctx.font = '16px Arial';
            ctx.fillText(variant.icon, 0, -10);
            ctx.restore();
        }

        // Ободок
        ctx.beginPath();
        ctx.arc(150, 150, 145, 0, 2 * Math.PI);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    renderWheel() {
        return `
            <div class="wheel-container">
                <div class="wheel-pointer"></div>
                <canvas width="300" height="300"></canvas>
            </div>
            <button class="spin-btn">🎲 КРУТИТЬ (${this.spinSpeed})</button>
        `;
    }

    renderRoulette() {
        return `
            <div class="roulette-container">
                ${this.variants.map((_, idx) => `
                    <div class="roulette-column">
                        ${this.variants.map((variant, vIdx) => `
                            <div class="roulette-item" style="background-color: ${variant.color}; color: #fff;">
                                <span>${variant.icon} ${variant.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <button class="spin-btn">🎲 КРУТИТЬ (${this.spinSpeed})</button>
        `;
    }

    renderBarrel() {
        return `
            <div class="barrel-container">
                ${this.variants.map((_, idx) => `
                    <div class="barrel" style="color: #333; font-size: 0.8em;">
                        ${this.variants.map((variant, vIdx) => `
                            <div class="barrel-item" style="background-color: ${variant.color}; color: #fff;">
                                ${variant.icon}<br>${variant.text}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <button class="spin-btn">🎲 КРУТИТЬ (${this.spinSpeed})</button>
        `;
    }

    renderList() {
        return `
            <div class="list-spinner">
                ${this.variants.map(variant => `
                    <div class="list-spinner-item" style="background-color: ${variant.color}; color: #fff;">
                        <span>${variant.icon}</span>
                        <span>${variant.text}</span>
                    </div>
                `).join('')}
            </div>
            <button class="spin-btn">🎲 КРУТИТЬ (${this.spinSpeed})</button>
        `;
    }

    renderSettings() {
        if (!this.variantsList) return;

        this.variantsList.innerHTML = this.variants.map(variant => `
            <div class="variant-item">
                <div class="variant-header">
                    <span class="variant-label">#${variant.id}</span>
                    <button class="delete-variant-btn" onclick="randomizer.deleteVariant(${variant.id})">Удалить</button>
                </div>
                
                <div class="variant-form-group">
                    <label>Текст:</label>
                    <input type="text" value="${variant.text}" 
                        onchange="randomizer.updateVariant(${variant.id}, 'text', this.value)">
                </div>

                <div class="variant-form-group">
                    <label>Иконка:</label>
                    <input type="text" value="${variant.icon}" maxlength="2"
                        onchange="randomizer.updateVariant(${variant.id}, 'icon', this.value)"
                        style="max-width: 80px;">
                </div>

                <div class="variant-form-group">
                    <label>Цвет:</label>
                    <input type="color" value="${variant.color}"
                        onchange="randomizer.updateVariant(${variant.id}, 'color', this.value)">
                </div>

                <div class="variant-form-group">
                    <label>Шанс:</label>
                    <input type="number" value="${variant.chance}" min="1" max="100"
                        onchange="randomizer.updateVariant(${variant.id}, 'chance', this.value)">
                    <span style="color: #999;">%</span>
                </div>
            </div>
        `).join('');

        if (this.speedValue) this.speedValue.textContent = this.spinSpeed;
        
        // Переприцепляем обработчик для кнопки добавления варианта
        const addBtn = this.settingsPanel.querySelector('.add-variant-btn');
        if (addBtn) {
            addBtn.removeEventListener('click', () => this.addVariant());
            addBtn.addEventListener('click', () => this.addVariant());
        }
    }

    updateControls() {
        if (this.modeSelect) this.modeSelect.value = this.currentMode;
        if (this.speedInput) this.speedInput.value = this.spinSpeed;
    }

    // ===== UTILITIES =====

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export для использования в других модулях
window.Randomizer = Randomizer;
