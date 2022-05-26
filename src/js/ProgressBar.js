export class ProgressBar {
  constructor(
    defaultValue = 0,
    gradient = 1,
    maxValue = 10,
    color = null,
    globalObject
  ) {
    this.value = defaultValue;
    this.gradient = gradient;
    this.maxValue = maxValue;
    this.color = color;
    this.globalObject = globalObject;
    //@TODO no.4 make it possible to create progress bar with any default value and gradient. these values should be passed to constructor
    //@TODO no.5 make it possible to create progress bar with any maximum value. once using maximum value, make sure the width of knob element is calculated correctly

    this.element = document.createElement("div");
    this.refreshElement();
  }

  refreshElement() {
    this.element.innerHTML = `
      <div class="label">
        ${this.value}/${this.maxValue}
      </div>
      <div class="progress">
         <div class="btn-minus"></div>
         <div class="bar">
           <div style="width: ${
             (this.value / this.maxValue) * 100
           }%; background-color:${this.color}" class="knob"></div>
         </div>
         <div class="btn-plus"></div>
      </div>
    `;

    const plusBtn = this.element.querySelector(".btn-plus");
    plusBtn.addEventListener("click", () => {
      this.value = Math.min(this.maxValue, this.value + this.gradient);
      this.globalObject[this.color] = this.value * 15;

      // console.log(this.globalObject);
      this.refreshElement();
    });

    const minusBtn = this.element.querySelector(".btn-minus");
    minusBtn.addEventListener("click", () => {
      this.value = Math.max(0, this.value - this.gradient);
      this.globalObject[this.color] = this.value * 15;
      // console.log(this.globalObject);
      this.refreshElement();
    });
    //@TODO no.3 implement minusBtn listener. if you assign new value to property value, make sure, it is not less then 0
  }
}
