# PowerShell script to clean up duplicate files

# Files to keep (destination files)
$essential_files = @(
    # New structure
    "src/features/chat/components",
    "src/features/chat/context",
    "src/features/chat/hooks",
    "src/features/gemini/services",
    "src/features/gemini/context",
    "src/features/gemini/hooks",
    "src/features/gemini/types",
    "src/features/gemini/api",
    "src/shared/components",
    "src/shared/context",
    "src/shared/hooks",
    "src/shared/utils",
    # Other important files
    "src/App.tsx",
    "src/main.tsx",
    "src/index.ts",
    "src/index.css",
    "src/custom-theme.css",
    "src/assets",
    "src/vite-env.d.ts"
)

# Files to remove (source files that are duplicated)
$duplicate_files = @(
    # Old component files
    "src/components/AppLayout.tsx",
    "src/components/Chat.tsx",
    "src/components/ChatInput.tsx",
    "src/components/Header.tsx",
    "src/components/HistoryPopup.tsx",
    "src/components/ThinkingIndicator.tsx",
    "src/components/WelcomeMessage.tsx",
    "src/components/CodeBlock.tsx",
    "src/components/ModelBadge.tsx",
    "src/components/ModelSelector.tsx",
    "src/components/ui/Button.tsx",
    "src/components/ui/LoadingIndicator.tsx",
    "src/components/ui/ThemeToggle.tsx",
    "src/components/SourceCitation.tsx",
    # Test and demo components
    "src/components/TestComponent.tsx",
    "src/components/TailwindTest.tsx",
    "src/components/TestGeminiApi.tsx",
    "src/components/SimpleGeminiTest.tsx",
    "src/components/AdvancedSearchDemo.tsx",
    # Old context files
    "src/context/ChatContext.tsx",
    "src/context/GeminiContext.tsx",
    "src/context/GeminiServiceContext.tsx",
    "src/context/ThemeContext.tsx",
    # Old hook files
    "src/hooks/useChat.ts",
    "src/hooks/useGemini.ts",
    "src/hooks/useTheme.ts",
    "src/hooks/useMediaQuery.ts",
    "src/hooks/useThinking.ts",
    # Old utils files
    "src/utils/geminiModels.ts",
    "src/utils/datetime.ts",
    # Old api files
    "src/api/gemini"
)

# First, report what will be done
Write-Host "Files to keep:" -ForegroundColor Green
foreach ($file in $essential_files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (missing)" -ForegroundColor Red
    }
}

Write-Host "`nFiles to remove:" -ForegroundColor Yellow
foreach ($file in $duplicate_files) {
    if (Test-Path $file) {
        Write-Host "  - $file" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ $file (already removed)" -ForegroundColor Green
    }
}

# Ask for confirmation
$confirm = Read-Host "`nConfirm deletion? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

# Remove duplicate files
foreach ($file in $duplicate_files) {
    if (Test-Path $file) {
        if (Test-Path $file -PathType Container) {
            # If it's a directory
            Remove-Item $file -Recurse -Force
            Write-Host "Removed directory: $file" -ForegroundColor Green
        } else {
            # If it's a file
            Remove-Item $file -Force
            Write-Host "Removed file: $file" -ForegroundColor Green
        }
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Green 