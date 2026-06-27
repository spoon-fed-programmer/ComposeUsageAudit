package com.domain.product

import com.common.compose.layout.GridList
import com.common.compose.card.ProductCard
import com.common.compose.button.IconButton
import com.common.compose.icon.SearchIcon

class ProductListFragment {
    fun displayProducts() {
        SearchIcon()
        IconButton() // Filters button
        
        GridList() // Contains multiple ProductCards
        ProductCard()
        ProductCard()
        ProductCard()
        ProductCard()
    }
}
