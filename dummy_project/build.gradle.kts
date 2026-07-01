plugins {
    kotlin("jvm") version "2.0.20"
    id("org.jetbrains.compose") version "1.6.11"
    id("org.jetbrains.dokka") version "1.9.20"
    kotlin("plugin.compose") version "2.0.20"
}


repositories {
    google()
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
}

dependencies {
    // Avoid compile errors on @Composable annotation
    implementation("androidx.compose.runtime:runtime:1.6.8")
    // Use Compose Multiplatform Desktop target to render screenshots on JVM
    implementation(compose.desktop.currentOs)
}

kotlin {
    sourceSets {
        main {
            kotlin.setSrcDirs(listOf("common/compose"))
        }
    }
}

tasks.register<JavaExec>("capturePreviews") {
    group = "documentation"
    description = "Generate preview screenshots for Compose components"
    mainClass.set("com.common.compose.CapturePreviewsKt")
    classpath = sourceSets["main"].runtimeClasspath
    systemProperty("java.awt.headless", "true")
}

tasks.dokkaHtml {
    dependsOn("capturePreviews")
    outputDirectory.set(file("${rootDir}/../docs/dokka"))
}

