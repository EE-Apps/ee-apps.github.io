/**
 * Randomizer Init Module
 * Инициализирует рандомайзер при загрузке страницы
 */

let randomizer = null;

document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем рандомайзер если он загружен
  if (typeof Randomizer !== 'undefined') {
    randomizer = new Randomizer();
    
    // Привязываем кнопку запуска
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('spin-btn') && randomizer) {
        randomizer.spin();
      }
    });

    // Переинициализируем при смене страницы
    const pageElements = document.querySelectorAll('.page');
    pageElements.forEach(page => {
      if (page.id === 'randomizer') {
        page.addEventListener('click', (e) => {
          if (e.target.classList.contains('spin-btn')) {
            randomizer.spin();
          }
        });
      }
    });

    console.log('✨ Randomizer initialized');
  }
});

// Глобальная функция для доступа к рандомайзеру
window.getRandomizer = () => randomizer;
