package com.domain.settings

import com.common.compose.button.PrimaryButton
import com.common.compose.input.SwitchInput
import com.common.compose.card.SettingsCard

class SettingsActivity {
    fun init() {
        SettingsCard()
        SwitchInput() // Push notification toggle
        SwitchInput() // Dark mode toggle
        
        PrimaryButton() // Save settings
    }
}
