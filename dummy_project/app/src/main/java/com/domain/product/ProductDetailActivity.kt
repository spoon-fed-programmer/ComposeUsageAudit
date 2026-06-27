package com.domain.product

import com.common.compose.button.PrimaryButton
import com.common.compose.button.IconButton
import com.common.compose.icon.ArrowBackIcon
import com.common.compose.layout.ResponsiveRow
import com.common.compose.card.ImageCard

class ProductDetailActivity {
    fun onCreateDetail() {
        ArrowBackIcon()
        ImageCard()
        ResponsiveRow()
        PrimaryButton() // Add to cart
        IconButton() // Add to wishlist
    }
}
