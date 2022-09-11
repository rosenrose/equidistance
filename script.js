const fileInput = document.querySelector("#fileInput");
const map = document.querySelector("img");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const pointsUl = document.querySelector("ul");
const radiusInput = document.querySelector("#radiusInput");
const drawCircles = document.querySelector("#drawCirclesBtn");
let points = [];
let radius = 0;

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  map.src = URL.createObjectURL(file);
  points = [];
  pointsUl.replaceChildren();
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
  addPoint(event.offsetX, event.offsetY);
  drawPoint(event.offsetX, event.offsetY);
});

function addPoint(x, y) {
  points.push([x, y]);
  console.log(points);

  const li = document.createElement("li");
  li.textContent = `${x}, ${y}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", (event) => {
    points = points.filter(([px, py]) => px !== x || py !== y);
    console.log(points);
    event.target.parentNode.remove();
  });

  li.append(deleteBtn);
  pointsUl.append(li);
}

function drawPoint(x, y) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

radiusInput.addEventListener("change", (event) => {
  const value = event.target.value;
  radius = value;
  event.target.setAttribute("value", value);

  clearBtn.click();
  drawCircles.click();
});
radiusInput.dispatchEvent(new InputEvent("change"));

drawCircles.addEventListener("click", () => {
  points.forEach(([x, y]) => {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  });
});

clearBtn.addEventListener("click", () => {
  drawImage(map);
  points.forEach(([x, y]) => drawPoint(x, y));
});
