import { ProgressBar } from "./ProgressBar";
const globalObject = {
  red: null,
  green: null,
  blue: null,
};

document.addEventListener("DOMContentLoaded", () => {
  // @TODO no.1 create new instance of ProgressBar and append it body element.
  //    you shouldn't pass the whole progress bar to appendChild method, but only specific property
  //    explore class ProgressBar and find out which property it is.

  const body = document.querySelector("body");

  const bar_red = new ProgressBar(0, 1, 17, "red", globalObject);
  body.appendChild(bar_red.element);

  const bar_green = new ProgressBar(0, 1, 17, "green", globalObject);
  body.appendChild(bar_green.element);

  const bar_blue = new ProgressBar(0, 1, 17, "blue", globalObject);
  body.appendChild(bar_blue.element);

  const btn = document.createElement("button");
  btn.textContent = "Create new background";
  body.appendChild(btn);

  btn.addEventListener("click", () => {
    console.log(globalObject);
    btn.style.backgroundColor = `rgb(${globalObject.red}, ${globalObject.green}, ${globalObject.blue})`;
  });
  // @TODO no.2 fix missing icon on plus button
  //fixed
});
