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
}
