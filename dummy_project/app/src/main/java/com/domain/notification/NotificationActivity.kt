package com.domain.notification

import com.common.compose.layout.ScrollableColumn
import com.common.compose.card.NotificationCard
import com.common.compose.icon.ArrowBackIcon

class NotificationActivity {
    fun loadNotifications() {
        ArrowBackIcon()
        ScrollableColumn()
        NotificationCard()
        NotificationCard()
        NotificationCard()
    }
}
