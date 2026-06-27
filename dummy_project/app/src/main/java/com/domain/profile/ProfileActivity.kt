package com.domain.profile

import com.common.compose.card.UserCard
import com.common.compose.input.TextInput
import com.common.compose.button.SecondaryButton
import com.common.compose.icon.ProfileIcon

class ProfileActivity {
    fun show() {
        ProfileIcon()
        UserCard()
        TextInput() // username
        TextInput() // email
        SecondaryButton() // Edit profile button
    }
}
