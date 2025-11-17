package com.lumiscape.smartwindow.global.util;

public class FileNameUtils {

    public static String addSuffixBeforeExtension(String fileName, String suffix) {
        if (fileName == null || fileName.isEmpty()) {
            return fileName;
        }

        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex == -1) {
            return fileName + suffix;
        } else {
            String name = fileName.substring(0, dotIndex);
            String extension = fileName.substring(dotIndex);
            return name + suffix + extension;
        }
    }

    public static String extractAITypeFromKey(String s3Objectkey) {
        if (s3Objectkey == null || s3Objectkey.isEmpty()) {
            return null;
        }

        String prefix = "_AI_";
        int aiPrefixIndex = s3Objectkey.lastIndexOf(prefix);
        if (aiPrefixIndex == -1) {
            return null;
        }

        int dotIndex = s3Objectkey.lastIndexOf(".");
        int startIndex = aiPrefixIndex + prefix.length();

        if (dotIndex == -1 || dotIndex < startIndex) {
            return s3Objectkey.substring(startIndex);
        } else {
            return s3Objectkey.substring(startIndex, dotIndex);
        }
    }
}
