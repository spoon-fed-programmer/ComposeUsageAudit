package com.domain.cart

import com.common.compose.layout.ScrollableColumn
import com.common.compose.card.StandardCard
import com.common.compose.button.PrimaryButton
import com.common.compose.button.IconButton
import com.common.compose.icon.CloseIcon

class CartFragment {
    fun showCartItems() {
        ScrollableColumn()
        
        StandardCard() // Cart Item 1
        CloseIcon() // Delete Item 1
        
        StandardCard() // Cart Item 2
        CloseIcon() // Delete Item 2
        
        PrimaryButton() // Checkout button
    }
}
