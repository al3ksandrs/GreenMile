let maxValue = 100;

let svgCircle = document.querySelectorAll(".foreground-circle svg circle");

let numberInsideCircle = document.getElementById("number-inside-circle");

// Get the stroke-dasharray value from CSS
let svgStrokeDashArray = parseInt(
    window
        .getComputedStyle(svgCircle[0])
        .getPropertyValue("stroke-dasharray")
        .replace("px", "")
);

// To animte the circle from the previous value
let previousStrokeDashOffset = svgStrokeDashArray;

// To animate the number from the previous value
let previousValue = 0;

let animationDuration = 1000;

// Call this method and pass any value to start the animation
// The 'value' should be in between 0 to maxValue
function animteCircle(value) {
    var offsetValue = Math.floor(
        ((maxValue - value) * svgStrokeDashArray) / maxValue
    );

    // This is to animate the circle
    svgCircle[0].animate(
        [
            // initial value
            {
                strokeDashoffset: previousStrokeDashOffset,
            },
            // final value
            {
                strokeDashoffset: offsetValue,
            },
        ],
        {
            duration: animationDuration,
        }
    );

    // Without this, circle gets filled 100% after the animation
    svgCircle[0].style.strokeDashoffset = offsetValue;

    // This is to animate the number.
    // If the current value and previous values are same,
    // no need to do anything. Check the condition.
    if (value != previousValue) {
        var speed;
        if (value > previousValue) {
            speed = animationDuration / (value - previousValue);
        } else {
            speed = animationDuration / (previousValue - value);
        }

        // start the animation from the previous value
        let counter = previousValue;

        let intervalId = setInterval(() => {
            if (counter == value || counter == -1) {
                // End of the animation

                clearInterval(intervalId);

                // Save the current values
                previousStrokeDashOffset = offsetValue;
                previousValue = value;
            } else {
                if (value > previousValue) {
                    counter += 1;
                } else {
                    counter -= 1;
                }

            }
        }, speed);
    }
}
// Animate with some value when the page loads first time
animteCircle(65);

window.onload = function() {

    hierteam3ding.API.queryDatabase(
        "SELECT decibel FROM informatie",
    ).then(function (data) {
        console.log(data);
        let decibelData = document.getElementById("decibelData");
        decibelData.innerText = data[0].decibel;
    }).catch(function (reason) {
        console.log(reason);
    });
    }