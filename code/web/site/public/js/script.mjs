document.addEventListener("DOMContentLoaded", () => {
  const error = window.errorMessage;
  if (error) {
    appendAlert(error, "danger");
  }

  const registerButton = document.getElementById("registerButton");
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      if (error) {
        appendAlert(error, "danger");
      }
    });
  }
});

const alertPlaceholder = document.getElementById("alertPlaceholder");
const appendAlert = (message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
};
