package com.common.compose

import androidx.compose.runtime.Composable
import androidx.compose.ui.ImageComposeScene
import androidx.compose.ui.use
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.background
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.Alignment
import com.common.compose.button.*
import com.common.compose.card.*
import com.common.compose.indicator.*
import java.io.File
import org.jetbrains.skia.Image
import org.jetbrains.skia.EncodedImageFormat

fun main() {
    println("Starting Compose Preview Capture with proper backgrounds and paths...")
    
    // componentName to Pair(Composable, packageName)
    val previews = mapOf<String, Pair<@Composable () -> Unit, String>>(
        "PrimaryButton" to Pair({ PrimaryButtonPreview() }, "com.common.compose.button"),
        "SecondaryButton" to Pair({ SecondaryButtonPreview() }, "com.common.compose.button"),
        "ProductCard" to Pair({ ProductCardPreview() }, "com.common.compose.card"),
        "UserCard" to Pair({ UserCardPreview() }, "com.common.compose.card"),
        "CircularProgressIndicator" to Pair({ CircularProgressIndicatorPreview() }, "com.common.compose.indicator"),
        "LinearProgressIndicator" to Pair({ LinearProgressIndicatorPreview() }, "com.common.compose.indicator")
    )
    
    val baseImgDir = File("../docs/dokka/images")
    
    previews.forEach { (name, pair) ->
        val (composable, pkgName) = pair
        try {
            println("Capturing preview for: $name ($pkgName)")
            
            val targetDirs = listOf(
                baseImgDir,
                File("../docs/dokka/dummy_project/$pkgName/images")
            )
            
            capturePreview(name, targetDirs, composable)
        } catch (e: Exception) {
            println("Failed to capture $name: ${e.message}")
            e.printStackTrace()
        }
    }
    println("Compose Preview Capture Finished successfully!")
}

fun capturePreview(name: String, targetDirs: List<File>, content: @Composable () -> Unit) {
    // Render off-screen (e.g. 300x120 size)
    ImageComposeScene(width = 300, height = 120).use { scene ->
        scene.setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                content()
            }
        }
        val renderDoc = scene.render()
        val data = renderDoc.encodeToData(EncodedImageFormat.PNG, 100)
        if (data != null) {
            val bytes = data.bytes
            targetDirs.forEach { dir ->
                if (!dir.exists()) {
                    dir.mkdirs()
                }
                val outputFile = File(dir, "$name.png")
                outputFile.writeBytes(bytes)
                println("Saved preview to: ${outputFile.canonicalPath}")
            }
        } else {
            throw Exception("Failed to encode Skia Image to PNG data")
        }
    }
}




