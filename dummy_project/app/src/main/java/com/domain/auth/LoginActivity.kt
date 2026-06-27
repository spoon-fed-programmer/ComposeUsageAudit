package com.domain.auth

import com.common.compose.input.TextInput
import com.common.compose.input.PasswordInput
import com.common.compose.button.PrimaryButton
import com.common.compose.dialog.ProgressDialog

class LoginActivity {
    fun handleLogin() {
        TextInput()
        PasswordInput()
        PrimaryButton() // Login trigger
        
        ProgressDialog() // Showing logging in...
    }
}
