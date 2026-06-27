package com.domain.home

import com.common.compose.button.PrimaryButton
import com.common.compose.layout.HeaderLayout
import com.common.compose.layout.FooterLayout
import com.common.compose.icon.MenuIcon
import com.common.compose.icon.SearchIcon

class HomeActivity {
    fun render() {
        HeaderLayout()
        MenuIcon()
        SearchIcon()
        
        // Render buttons multiple times
        PrimaryButton()
        PrimaryButton()
        
        FooterLayout()
    }
}
