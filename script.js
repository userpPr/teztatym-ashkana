/* Добавляет заказ + Очищает весь заказ + Очищает последние заказы 

v. 1.232.342 */

const orderList = document.getElementById('order-list');
const totalEl = document.getElementById('total');
const clearBtn = document.getElementById('clear-order');
const clearLastBtn = document.getElementById('replace-last');
//const scriptURL = 'https://script.google.com/macros/s/AKfycbxyDqCqm_Sbr_UWzEpOJi_lek4wxaJhifW0v0CR3NsJh5M3DbhlgE9v-Uzp91hHD_4F/exec';
const scriptURL = 'https://script.google.com/macros/s/AKfycbz2ptOES026i-R3gz0i97uT3KnZ5ibf08uzOMxsrpu6VpBIUby5rbPJMR2upyblaIIm/exec';

let total = 0;
const orderItems = []; // { name, price, quantity, element, input }

function addToOrder(dishName, price) {
  // Ищем уже добавленное блюдо
  const existing = orderItems.find(item => item.name === dishName);

  if (existing) {
    // Если нашли — увеличиваем и обновляем поле
    existing.quantity++;
    existing.input.value = existing.quantity;
  } else {
    // Если нет — создаём новую запись с input
    const itemEl = document.createElement('div');
    const text = document.createElement('span');
    text.textContent = `${dishName} - ${price} сом`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = '1';
    input.style.width = '40px';
    input.style.marginLeft = '10px';

    itemEl.appendChild(text);
    itemEl.appendChild(input);
    orderList.appendChild(itemEl);

    const newItem = {
      name: dishName,
      price,
      quantity: 1,
      element: itemEl,
      input
    };
    orderItems.push(newItem);

    // Слушаем прямое изменение количества
    input.addEventListener('input', () => {
      let qty = parseInt(input.value, 10);
      
      // Если не число или меньше 1 — ставим 1
      if (isNaN(qty) || qty < 1) {
        qty = 1;
        input.value = 1;
      }
      newItem.quantity = qty;
      updateTotal();
    });
  }
  updateTotal();
}

function updateTotal() {
  total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  totalEl.textContent = total;
}

// Удаляет весь заказ
clearBtn.addEventListener('click', () => {
  orderList.innerHTML = '';
  orderItems.length = 0;
  updateTotal();
});

// Удаляет последнии заказы
clearLastBtn.addEventListener('click', () => {
  const removed = orderItems.pop();
  if (removed) {
    orderList.removeChild(removed.element);
    updateTotal();
  }
});

/* Конфетти для кнопки "Оформить заказ" */

document.getElementById("placeAnOrder").addEventListener("click", (e) => {
  const count = 20;
  const button = e.target;
  const rect = button.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 60 + 20;

    confetti.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    confetti.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    confetti.style.left = `${rect.left + rect.width / 2}px`;
    confetti.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 600);
  }
});

/* Shake button */

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.add("vibrate");

    setTimeout(() => {
      button.classList.remove("vibrate");
    }, 300);
  });
});

/* Заказ принят + Google Sheets + конфетти */

  document.getElementById("placeAnOrder").addEventListener("click", () => {
  if (orderItems.length === 0) {
    alert("Сначала выберите блюда!");
    return;
  }
  
  // Взаимодействие с Google Sheets
  const formData = new FormData();
  orderItems.forEach((item, index) => {
  formData.append(`name${index+1}`, item.name);
  formData.append(`price${index+1}`, item.price);
  formData.append(`quantity${index+1}`, item.quantity);
  });
  formData.append("total", total);

  fetch(scriptURL, { method: "POST", body: formData })
  .then(res => res.json())
  .then(data => console.log("Success", data))
  .catch(err => console.error("Error", err));

  // Показать fullscreen-подтверждение
  const confirmation = document.getElementById("fullscreen-confirmation");
  const confettiContainer = document.getElementById("confetti-container");

  confirmation.classList.add("show");

  // Генерация конфетти
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = Math.random() * 20 + "vh";
    confetti.style.backgroundColor = randomColor();
    confettiContainer.appendChild(confetti);

    // Удалить после анимации
    setTimeout(() => confetti.remove(), 1000);
  }

  // Скрыть fullscreen через 1 секунду
  setTimeout(() => {
    confirmation.classList.remove("show");
  }, 1000);

  // Очистка текущего заказа
  orderItems.length = 0;
  total = 0;
  document.getElementById('order-list').innerHTML = '';
  document.getElementById('total').textContent = '0';
});

// Генератор случайного яркого цвета
function randomColor() {
  const colors = ["#00ff99", "#ff69b4", "#ffd700", "#ff4500", "#1e90ff"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* Зачеркнуть блюда которые закончились */

  // document.querySelectorAll('.dish').forEach(dish => {
  //   dish.addEventListener('click', function(e) {
  //     // Чтобы не срабатывать при клике на кнопку "+"
  //     if (e.target.tagName !== 'BUTTON') {
  //       this.classList.toggle('strike');
  //     }
  //   });
  // });

  document.querySelectorAll('.dish').forEach(dish => {
  dish.addEventListener('click', function(e) {
    // Чтобы не срабатывать при клике на кнопку "+"
    if (e.target.tagName !== 'BUTTON') {
      this.classList.toggle('strike');

      const button = this.querySelector('button');
      if (this.classList.contains('strike')) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    }
  });
});

/* Темная тема */

/* ... */
