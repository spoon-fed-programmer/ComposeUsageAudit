package com.domain.auth

import com.common.compose.input.TextInput
import com.common.compose.input.PasswordInput
import com.common.compose.input.CheckboxInput
import com.common.compose.button.PrimaryButton
import com.common.compose.dialog.ConfirmDialog

class RegisterActivity {
    fun renderRegistrationForm() {
        TextInput() // Name
        TextInput() // Email
        PasswordInput() // PW
        PasswordInput() // PW Check
        
        CheckboxInput() // Agree to terms
        
        PrimaryButton() // Submit register
        
        ConfirmDialog() // Confirm terms
    }
}
