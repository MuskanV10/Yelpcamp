(function () {
    'use strict'


    // bsCustomFileInput.init()
    
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault() //Stop doing what you were going to do.
                    event.stopPropagation() //Don’t tell your parents about this.
                }

                form.classList.add('was-validated')
            }, false)
        })
})()