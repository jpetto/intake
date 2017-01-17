(function() {
    'use strict';

    // get ye olde element references
    var form = document.getElementById('form');
    var name = document.getElementById('name');
    var email = document.getElementById('email');

    // assume the worst
    var formOk = false;

    // check for native validation support
    var nativeValidation = typeof name.checkValidity === 'function';

    // disable native validation for consistent behavior in A-grade browsers
    form.setAttribute('novalidate', 'true');

    // display or hide error message
    function toggleErrorMessage(parent, label, showError) {
        if (showError) {
            parent.className += ' has-error';
            label.className = label.className.replace('hidden', '').trim();

            //parent.classList.add('has-error');
            //label.classList.remove('hidden');
        } else {
            parent.className = parent.className.replace('has-error', '').trim();
            label.className += ' hidden';
            //parent.classList.remove('has-error');
            //label.classList.add('hidden');
        }
    }

    // make sure field is valid
    function validateField(field) {
        // field's container element
        var parent = field.parentNode;
        // field's error label sibling
        var label = parent.querySelector('.label');
        // default to not showing an error
        var showError = false;

        // show error if field is blank
        if (!field.value) {
            showError = true;
        } else {
            // show error if email is invalid
            if (field.getAttribute('type') === 'email') {
                // simple email regex - just checks for a single @ that's not
                // the first or last character
                if (!(/^[^@]+@[^@]+.[^@]*$/).test(field.value)) {
                    showError = true;
                }
            }
        }

        // show or hide the error message
        toggleErrorMessage(parent, label, showError);

        // store form state
        formOk = !showError;
    }

    function validateForm(e) {
        // safari doesn't validate on submit, hence the dance here
        // https://bugs.webkit.org/show_bug.cgi?id=164382 >:(
        e.preventDefault();

        if (!nativeValidation || !form.checkValidity()) {
            validateField(name);
            validateField(email);

            // focus the first field with an error
            form.querySelector('.has-error input').focus();
        } else {
            // form is okay, so drop the submit listener and re-submit
            form.removeEventListener('submit', validateForm);
            form.submit();
        }
    }

    // wire up the event listeners
    name.addEventListener('blur', function() {
        validateField(name);
    });

    email.addEventListener('blur', function() {
        validateField(email);
    });

    form.addEventListener('submit', validateForm);
})();
