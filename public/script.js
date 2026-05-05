const menuButton = document.getElementById("menuButton")
const navLinks = document.getElementById("navLinks")

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("show")
  })

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show")
    })
  })
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries())
}

async function connectForm(formId, endpoint, messageId) {
  const form = document.getElementById(formId)
  const message = document.getElementById(messageId)

  if (!form || !message) {
    return
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault()
    message.textContent = "Sending..."
    message.className = "form-message"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formToObject(form))
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        message.textContent = result.message || "Something went wrong."
        message.classList.add("error")
        return
      }

      message.textContent = result.message
      message.classList.add("success")
      form.reset()
    } catch (error) {
      message.textContent = "Cannot send right now. Please call or email us."
      message.classList.add("error")
    }
  })
}

connectForm("tuitionForm", "/api/tuition", "tuitionMessage")
connectForm("contactForm", "/api/contact", "contactMessage")
connectForm("tourForm", "/api/tour", "tourMessage")
