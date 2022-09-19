const fileInput = document.querySelector("#fileInput");
const pasteBtn = document.querySelector("#pasteBtn");
const map = document.querySelector("img");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const pointsUl = document.querySelector("#pointsUl");
const radiusInput = document.querySelector("#radiusInput");
const drawCirclesBtn = document.querySelector("#drawCirclesBtn");
const eraseCirclesBtn = document.querySelector("#eraseCirclesBtn");
const clearBtn = document.querySelector("#clearBtn");
const equidistanceBtn = document.querySelector("#equidistanceBtn");
const coords = document.querySelector("#coords");
let [mainPoints, subPoints] = [[], []];
let radius = 0;
const distanceOfPoints = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const sum = (items) => items.reduce((a, b) => a + b);

fileInput.addEventListener("input", (event) => newImage(event.target.files[0]));

function newImage(file) {
  map.src = URL.createObjectURL(file);
  initPoints();
}

function initPoints() {
  [mainPoints, subPoints] = [[], []];
  pointsUl.replaceChildren();
}

document.addEventListener("paste", (event) => {
  const data = event.clipboardData || window.clipboardData;
  newImage(data.files[0]);
});

pasteBtn.addEventListener("click", async () => {
  const data = await navigator.clipboard.read();
  const blob = await data[0].getType("image/png");
  const datatransfer = new DataTransfer();

  datatransfer.items.add(new File([blob], "image.png", { type: blob.type }));
  newImage(datatransfer.files[0]);
});

map.addEventListener("load", (event) => {
  const img = event.target;
  [canvas.width, canvas.height] = [img.naturalWidth, img.naturalHeight];
  radiusInput.max = Math.max(img.naturalWidth, img.naturalHeight);

  drawImage(img);
});

function drawImage(img) {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("click", (event) => {
  const [x, y] = [event.offsetX, event.offsetY];

  addMainPoint(x, y);
  drawPoint(x, y, "red");
});

canvas.addEventListener("mousemove", (event) => {
  coords.textContent = `${event.offsetX}, ${event.offsetY}`;
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const [x, y] = [event.offsetX, event.offsetY];

  subPoints.push({ x, y });
  drawPoint(x, y, "green");
});

function addMainPoint(x, y) {
  mainPoints.push({ x, y });

  const li = document.createElement("li");
  li.textContent = `${x}, ${y}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", (event) => {
    mainPoints = mainPoints.filter((p) => p.x !== x || p.y !== y);
    event.target.parentNode.remove();
  });

  li.append(deleteBtn);
  pointsUl.append(li);
}

function drawPoint(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

radiusInput.addEventListener("input", (event) => {
  const value = event.target.value;
  radius = value;
  event.target.setAttribute("value", value);

  eraseCirclesBtn.click();
  drawCirclesBtn.click();
});
radiusInput.dispatchEvent(new InputEvent("input"));

drawCirclesBtn.addEventListener("click", () => {
  mainPoints.forEach(({ x, y }) => drawCircle(x, y, "red"));
});

function drawCircle(x, y, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

eraseCirclesBtn.addEventListener("click", () => {
  drawImage(map);
  mainPoints.forEach(({ x, y }) => drawPoint(x, y, "red"));
  subPoints.forEach(({ x, y }) => drawPoint(x, y, "blue"));
});

clearBtn.addEventListener("click", () => {
  drawImage(map);
  initPoints();
});

equidistanceBtn.addEventListener("click", () => {
  if (mainPoints.length < 2) {
    return;
  }

  const calculated = [];

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const distances = mainPoints.map((point) => distanceOfPoints(point, { x, y }));

      const distSum = sum(distances);
      const average = distSum / distances.length;
      const deviation = Math.sqrt(sum(distances.map((dist) => Math.abs(dist - average) ** 2)));

      calculated.push({ x, y, distSum, deviation });
    }
  }

  const threshold = parseInt(canvas.width * canvas.height * 0.001);
  const equiPoints = calculated
    .sort((a, b) => a.deviation - b.deviation)
    .slice(0, threshold)
    .sort((a, b) => a.distSum - b.distSum);

  // console.log(equiPoints);
  // subPoints = [...subPoints, ...equiPoints];
  subPoints.push(equiPoints[0]);
  eraseCirclesBtn.click();
});
