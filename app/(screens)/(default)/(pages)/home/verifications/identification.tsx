import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import {
  Camera,
  Check,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Input from "@/components/input";
import Select from "@/components/select";
import DatePicker from "@/components/date-picker";
import { idTypes } from "@/components/others";
import axios from "@/api/axios";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type ScanStep = "SELECT_TYPE" | "SCAN_FRONT" | "SCAN_BACK" | "FACE" | "RESULTS";

interface ExtractedIdInfo {
  idTypeDetected: string;
  idNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  address: string;
  rawText: string;
}

const EMPTY_RESULT: ExtractedIdInfo = {
  idTypeDetected: "",
  idNumber: "",
  lastName: "",
  firstName: "",
  middleName: "",
  dateOfBirth: "",
  address: "",
  rawText: "",
};

/**
 * =========================================================
 * DATE HELPERS
 * =========================================================
 */

/**
 * Convert OCR date into a JavaScript Date.
 *
 * Supports:
 *
 * MM/DD/YYYY
 * MM-DD-YYYY
 * YYYY/MM/DD
 * YYYY-MM-DD
 * JANUARY 15, 2000
 * JAN 15, 2000
 */
const parseBirthDate = (value: string): Date | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.trim();

  /**
   * -------------------------------------------------------
   * MM/DD/YYYY or MM-DD-YYYY
   * -------------------------------------------------------
   */

  let match = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);

  if (match) {
    const [, month, day, year] = match;

    const numericMonth = Number(month);
    const numericDay = Number(day);
    const numericYear = Number(year);

    const date = new Date(numericYear, numericMonth - 1, numericDay);

    /**
     * Prevent invalid dates such as:
     *
     * 02/31/2000
     */

    if (
      date.getFullYear() === numericYear &&
      date.getMonth() === numericMonth - 1 &&
      date.getDate() === numericDay
    ) {
      return date;
    }

    return undefined;
  }

  /**
   * -------------------------------------------------------
   * YYYY/MM/DD or YYYY-MM-DD
   * -------------------------------------------------------
   */

  match = normalized.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);

  if (match) {
    const [, year, month, day] = match;

    const numericYear = Number(year);
    const numericMonth = Number(month);
    const numericDay = Number(day);

    const date = new Date(numericYear, numericMonth - 1, numericDay);

    if (
      date.getFullYear() === numericYear &&
      date.getMonth() === numericMonth - 1 &&
      date.getDate() === numericDay
    ) {
      return date;
    }

    return undefined;
  }

  /**
   * -------------------------------------------------------
   * Written date
   *
   * JANUARY 15, 2000
   * JAN 15, 2000
   * -------------------------------------------------------
   */

  const writtenDate = new Date(normalized);

  if (!isNaN(writtenDate.getTime())) {
    return writtenDate;
  }

  return undefined;
};

/**
 * =========================================================
 * FORMAT DATE FOR APP
 * =========================================================
 *
 * Date picker -> YYYY-MM-DD
 *
 * This is also safe for MySQL DATE.
 *
 * Example:
 *
 * August 24, 2026
 * ->
 * 2026-08-24
 */
const formatBirthDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

/**
 * =========================================================
 * FORMAT DATE FOR LARAVEL / MYSQL
 * =========================================================
 *
 * This is the final safety layer before submitting.
 *
 * Accepted:
 *
 * 08/24/2026
 * 08-24-2026
 * 2026/08/24
 * 2026-08-24
 * August 24, 2026
 *
 * Output:
 *
 * 2026-08-24
 */
const formatDateForLaravel = (value: string): string => {
  if (!value?.trim()) {
    return "";
  }

  const normalized = value.trim();

  /**
   * -------------------------------------------------------
   * Already YYYY-MM-DD
   * -------------------------------------------------------
   */

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = parseBirthDate(normalized);

    if (!parsed) {
      return "";
    }

    return normalized;
  }

  /**
   * -------------------------------------------------------
   * MM/DD/YYYY or MM-DD-YYYY
   * -------------------------------------------------------
   */

  let match = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);

  if (match) {
    const [, month, day, year] = match;

    const numericMonth = Number(month);
    const numericDay = Number(day);
    const numericYear = Number(year);

    const date = new Date(numericYear, numericMonth - 1, numericDay);

    /**
     * Make sure the date is actually valid.
     */

    if (
      date.getFullYear() !== numericYear ||
      date.getMonth() !== numericMonth - 1 ||
      date.getDate() !== numericDay
    ) {
      return "";
    }

    return `${numericYear}-${String(numericMonth).padStart(
      2,
      "0",
    )}-${String(numericDay).padStart(2, "0")}`;
  }

  /**
   * -------------------------------------------------------
   * YYYY/MM/DD
   * -------------------------------------------------------
   */

  match = normalized.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);

  if (match) {
    const [, year, month, day] = match;

    const numericYear = Number(year);
    const numericMonth = Number(month);
    const numericDay = Number(day);

    const date = new Date(numericYear, numericMonth - 1, numericDay);

    if (
      date.getFullYear() !== numericYear ||
      date.getMonth() !== numericMonth - 1 ||
      date.getDate() !== numericDay
    ) {
      return "";
    }

    return `${numericYear}-${String(numericMonth).padStart(
      2,
      "0",
    )}-${String(numericDay).padStart(2, "0")}`;
  }

  /**
   * -------------------------------------------------------
   * Written date
   * -------------------------------------------------------
   */

  const parsed = parseBirthDate(normalized);

  if (parsed) {
    return formatBirthDate(parsed);
  }

  return "";
};

/**
 * =========================================================
 * MAIN
 * =========================================================
 */

export default function Identification() {
  const { getUser } = useAuth();

  /**
   * -------------------------------------------------------
   * CAMERA PERMISSION
   * -------------------------------------------------------
   */

  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  /**
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [scanStep, setScanStep] = useState<ScanStep>("SELECT_TYPE");

  const [selectedIdType, setSelectedIdType] = useState("");

  const [frontImage, setFrontImage] = useState<string | null>(null);

  const [backImage, setBackImage] = useState<string | null>(null);

  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [frontText, setFrontText] = useState<string[]>([]);

  const [backText, setBackText] = useState<string[]>([]);

  const [extractedInfo, setExtractedInfo] =
    useState<ExtractedIdInfo>(EMPTY_RESULT);

  const [isProcessing, setIsProcessing] = useState(false);

  const [editing, setEditing] = useState(false);

  /**
   * -------------------------------------------------------
   * DATE OF BIRTH
   * -------------------------------------------------------
   *
   * Separate Date object for the date picker.
   *
   * extractedInfo.dateOfBirth is stored as:
   *
   * YYYY-MM-DD
   */

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  /**
   * =========================================================
   * IMAGE COMPRESSION
   * =========================================================
   */

  const compressIdImage = async (uri: string) => {
    try {
      const context = ImageManipulator.manipulate(uri);

      context.resize({
        width: 1600,
      });

      const renderedImage = await context.renderAsync();

      const result = await renderedImage.saveAsync({
        compress: 0.6,
        format: SaveFormat.JPEG,
      });

      console.log("ID IMAGE COMPRESSED:", result.uri);

      return result.uri;
    } catch (error) {
      console.error("ID IMAGE COMPRESSION ERROR:", error);

      return uri;
    }
  };

  /**
   * =========================================================
   * SELFIE COMPRESSION
   * =========================================================
   */

  const compressSelfieImage = async (uri: string) => {
    try {
      const context = ImageManipulator.manipulate(uri);

      context.resize({
        width: 1200,
      });

      const renderedImage = await context.renderAsync();

      const result = await renderedImage.saveAsync({
        compress: 0.6,
        format: SaveFormat.JPEG,
      });

      console.log("SELFIE IMAGE COMPRESSED:", result.uri);

      return result.uri;
    } catch (error) {
      console.error("SELFIE IMAGE COMPRESSION ERROR:", error);

      return uri;
    }
  };

  /**
   * =========================================================
   * PROGRESS
   * =========================================================
   */

  const progress = useMemo(() => {
    switch (scanStep) {
      case "SELECT_TYPE":
        return 0;

      case "SCAN_FRONT":
        return 25;

      case "SCAN_BACK":
        return 50;

      case "FACE":
        return 75;

      case "RESULTS":
        return 100;

      default:
        return 0;
    }
  }, [scanStep]);

  /**
   * =========================================================
   * CAMERA PERMISSION
   * =========================================================
   */

  const ensureCameraPermission = async () => {
    if (cameraPermission?.granted) {
      return true;
    }

    const permission = await requestCameraPermission();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to continue with identity verification.",
      );

      return false;
    }

    return true;
  };

  /**
   * =========================================================
   * ID CAMERA
   * =========================================================
   */

  const openCamera = async (side: "front" | "back") => {
    const allowed = await ensureCameraPermission();

    if (!allowed) {
      return;
    }

    try {
      setIsProcessing(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.back,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      /**
       * ---------------------------------------------------
       * COMPRESS + RESIZE
       * ---------------------------------------------------
       */

      const compressedUri = await compressIdImage(image.uri);

      /**
       * ---------------------------------------------------
       * OCR
       * ---------------------------------------------------
       */

      const ocr = await TextRecognition.recognize(compressedUri);

      const lines = normalizeOCR(
        ocr.blocks.map((block) => block.text).join("\n"),
      );

      /**
       * ---------------------------------------------------
       * FRONT
       * ---------------------------------------------------
       */

      if (side === "front") {
        setFrontImage(compressedUri);

        setFrontText(lines);

        setScanStep("SCAN_BACK");

        return;
      }

      /**
       * ---------------------------------------------------
       * BACK
       * ---------------------------------------------------
       */

      setBackImage(compressedUri);

      setBackText(lines);

      /**
       * ---------------------------------------------------
       * PARSE INFORMATION
       * ---------------------------------------------------
       */

      const parsed = parseId({
        idType: selectedIdType,
        frontLines: frontText,
        backLines: lines,
      });

      setExtractedInfo(parsed);

      /**
       * ---------------------------------------------------
       * INITIALIZE DATE PICKER
       * ---------------------------------------------------
       */

      const parsedDate = parseBirthDate(parsed.dateOfBirth);

      setBirthDate(parsedDate);

      /**
       * ---------------------------------------------------
       * FACE
       * ---------------------------------------------------
       */

      setScanStep("FACE");
    } catch (error) {
      console.error("OCR ERROR:", error);

      Alert.alert(
        "Unable to Read ID",
        "We couldn't read the ID clearly. Please retake the photo using good lighting and make sure all text is visible.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * =========================================================
   * FACE CAPTURE
   * =========================================================
   */

  const captureFace = async () => {
    const allowed = await ensureCameraPermission();

    if (!allowed) {
      return;
    }

    try {
      setIsProcessing(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.front,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      const compressedUri = await compressSelfieImage(image.uri);

      setSelfieImage(compressedUri);

      setScanStep("RESULTS");
    } catch (error) {
      console.error("SELFIE ERROR:", error);

      Alert.alert(
        "Unable to Capture Selfie",
        "We couldn't capture your selfie. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * =========================================================
   * OCR NORMALIZATION
   * =========================================================
   */

  const normalizeOCR = (text: string): string[] => {
    return text
      .split(/\r?\n/)
      .map((line) =>
        line
          .replace(/[|]/g, "I")
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
  };

  /**
   * =========================================================
   * CLEAN VALUE
   * =========================================================
   */

  const cleanValue = (value: string) => {
    return value
      .replace(
        /^(last\s*name|first\s*name|middle\s*name|surname|given\s*name|given\s*names|apelyido|pangalan|gitnang\s*name|gitnang\s*pangalan)\s*[:\-]?\s*/i,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
  };

  /**
   * =========================================================
   * FIND VALUE AFTER LABEL
   * =========================================================
   */

  const findAfterLabel = (lines: string[], labels: string[]) => {
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];

      for (const label of labels) {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(`^${escapedLabel}\\s*[:\\-]?\\s*(.*)$`, "i");

        const match = current.match(regex);

        if (!match) {
          continue;
        }

        /**
         * Same line
         */

        const sameLine = match[1]?.trim();

        if (sameLine) {
          return cleanValue(sameLine);
        }

        /**
         * Next line
         */

        const next = lines[i + 1];

        if (next) {
          return cleanValue(next);
        }
      }
    }

    return "";
  };

  /**
   * =========================================================
   * DATE OF BIRTH OCR
   * =========================================================
   */

  const findDateOfBirth = (lines: string[]): string => {
    const numericDate =
      /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/;

    const yearFirstDate =
      /\b(19|20)\d{2}[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])\b/;

    const writtenDate =
      /\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{1,2},?\s+(19|20)\d{2}\b/i;

    const shortWrittenDate =
      /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+(19|20)\d{2}\b/i;

    for (const line of lines) {
      const numeric = line.match(numericDate);

      if (numeric) {
        return numeric[0];
      }

      const yearFirst = line.match(yearFirstDate);

      if (yearFirst) {
        return yearFirst[0];
      }

      const written = line.match(writtenDate);

      if (written) {
        return written[0];
      }

      const shortWritten = line.match(shortWrittenDate);

      if (shortWritten) {
        return shortWritten[0];
      }
    }

    return "";
  };

  /**
   * =========================================================
   * ID NUMBER
   * =========================================================
   */

  const findIdNumber = (lines: string[], idType: string): string => {
    const text = lines.join(" ");

    /**
     * Philippine National ID
     */

    if (/national\s*id|phil.?sys|philsys/i.test(idType)) {
      const patterns = [
        /\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b/,
        /\b\d{16}\b/,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match) {
          return match[0];
        }
      }
    }

    /**
     * UMID
     */

    if (/umid/i.test(idType)) {
      const match = text.match(/\b\d{4}[-\s]\d{7}[-\s]\d\b/);

      if (match) {
        return match[0];
      }
    }

    /**
     * Driver's License
     */

    if (/driver|lto/i.test(idType)) {
      const match = text.match(/\b[A-Z]\d{2}[-\s]\d{2}[-\s]\d{6}\b/i);

      if (match) {
        return match[0];
      }
    }

    /**
     * Generic patterns
     */

    const genericPatterns = [
      /\b[A-Z]{1,3}[-\s]?\d{5,12}\b/i,
      /\b\d{4}[-\s]\d{4}[-\s]\d{4}\b/,
      /\b\d{10,16}\b/,
    ];

    for (const pattern of genericPatterns) {
      const match = text.match(pattern);

      if (match) {
        return match[0];
      }
    }

    return "";
  };

  /**
   * =========================================================
   * NAME PARSER
   * =========================================================
   */

  const findNames = (lines: string[]) => {
    let lastName = findAfterLabel(lines, [
      "LAST NAME",
      "LASTNAME",
      "SURNAME",
      "APELYIDO",
    ]);

    let firstName = findAfterLabel(lines, [
      "FIRST NAME",
      "FIRSTNAME",
      "GIVEN NAME",
      "GIVEN NAMES",
      "PANGALAN",
      "MGA PANGALAN",
    ]);

    let middleName = findAfterLabel(lines, [
      "MIDDLE NAME",
      "MIDDLENAME",
      "MIDDLE",
      "GITNANG PANGALAN",
    ]);

    /**
     * LTO numbered names
     */

    if (!lastName) {
      const line = lines.find((x) => /^1[\.\-\s]+/.test(x));

      if (line) {
        lastName = cleanValue(line.replace(/^1[\.\-\s]+/, ""));
      }
    }

    if (!firstName) {
      const line = lines.find((x) => /^2[\.\-\s]+/.test(x));

      if (line) {
        firstName = cleanValue(line.replace(/^2[\.\-\s]+/, ""));
      }
    }

    if (!middleName) {
      const line = lines.find((x) => /^3[\.\-\s]+/.test(x));

      if (line) {
        middleName = cleanValue(line.replace(/^3[\.\-\s]+/, ""));
      }
    }

    return {
      lastName,
      firstName,
      middleName,
    };
  };

  /**
   * =========================================================
   * ADDRESS PARSER
   * =========================================================
   */

  const findAddress = (lines: string[]): string => {
    const addressLabels = [
      "ADDRESS",
      "RESIDENTIAL ADDRESS",
      "RESIDENCE ADDRESS",
      "HOME ADDRESS",
      "PERMANENT ADDRESS",
      "CURRENT ADDRESS",
      "COMPLETE ADDRESS",
      "PRESENT ADDRESS",
      "MAILING ADDRESS",
      "ADDRESS OF RESIDENCE",
      "RESIDENCE",
      "TIRAHAN",
      "ADRES",
    ];

    const isInvalidAddressLine = (value: string) => {
      if (!value) {
        return true;
      }

      const upper = value.toUpperCase();

      return (
        upper.includes("DATE OF BIRTH") ||
        upper.includes("BIRTH DATE") ||
        upper.includes("NATIONALITY") ||
        upper.includes("CITIZENSHIP") ||
        upper === "MALE" ||
        upper === "FEMALE" ||
        upper.includes("SEX") ||
        upper.includes("GENDER") ||
        upper.includes("BLOOD TYPE") ||
        upper.includes("SIGNATURE") ||
        upper.includes("EXPIRY") ||
        upper.includes("DATE ISSUED") ||
        upper.includes("ID NUMBER") ||
        upper.includes("LICENSE NO") ||
        upper.includes("LICENSE NUMBER") ||
        upper.includes("NATIONAL ID")
      );
    };

    const cleanAddress = (value: string) => {
      return value
        .replace(
          /^(residential\s+address|residence\s+address|home\s+address|permanent\s+address|current\s+address|complete\s+address|present\s+address|mailing\s+address|address\s+of\s+residence|address|tirahan|adres)\s*[:\-]?\s*/i,
          "",
        )
        .replace(/\s+/g, " ")
        .trim();
    };

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i].trim();

      for (const label of addressLabels) {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(`^${escapedLabel}\\s*[:\\-]?\\s*(.*)$`, "i");

        const match = current.match(regex);

        if (!match) {
          continue;
        }

        /**
         * Address on same line
         */

        if (match[1]?.trim()) {
          const value = cleanAddress(match[1]);

          if (!isInvalidAddressLine(value)) {
            return value;
          }
        }

        /**
         * Address on next lines
         */

        const addressParts: string[] = [];

        for (let j = i + 1; j < lines.length; j++) {
          const next = lines[j].trim();

          if (isInvalidAddressLine(next)) {
            break;
          }

          if (
            /^(first|last|middle|given|date|birth|sex|gender|nationality|citizenship|civil|marital|id|license|expiry|signature|blood|height|weight)/i.test(
              next,
            )
          ) {
            break;
          }

          addressParts.push(next);

          if (addressParts.length >= 4) {
            break;
          }
        }

        if (addressParts.length > 0) {
          return cleanAddress(addressParts.join(", "));
        }
      }
    }

    return "";
  };

  /**
   * =========================================================
   * ID PARSER
   * =========================================================
   */

  const parseId = ({
    idType,
    frontLines,
    backLines,
  }: {
    idType: string;
    frontLines: string[];
    backLines: string[];
  }): ExtractedIdInfo => {
    const lines = [...frontLines, ...backLines];

    const names = findNames(frontLines);

    const dateOfBirth =
      findDateOfBirth(frontLines) || findDateOfBirth(backLines);

    const idNumber = findIdNumber(lines, idType);

    const address = findAddress(backLines) || findAddress(frontLines);

    return {
      idTypeDetected: idType,
      idNumber,
      lastName: names.lastName,
      firstName: names.firstName,
      middleName: names.middleName,
      dateOfBirth,
      address,
      rawText: lines.join("\n"),
    };
  };

  /**
   * =========================================================
   * RESET
   * =========================================================
   */

  const resetScanner = () => {
    setScanStep("SELECT_TYPE");

    setSelectedIdType("");

    setFrontImage(null);

    setBackImage(null);

    setSelfieImage(null);

    setFrontText([]);

    setBackText([]);

    setExtractedInfo(EMPTY_RESULT);

    setBirthDate(undefined);

    setEditing(false);

    setIsProcessing(false);
  };

  /**
   * =========================================================
   * UPDATE FIELD
   * =========================================================
   */

  const updateField = (field: keyof ExtractedIdInfo, value: string) => {
    setExtractedInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /**
   * =========================================================
   * DATE OF BIRTH CHANGE
   * =========================================================
   */

  const handleBirthDateChange = (date: Date) => {
    setBirthDate(date);

    /**
     * Store the date as:
     *
     * YYYY-MM-DD
     *
     * Example:
     *
     * 2026-08-24
     */

    updateField("dateOfBirth", formatBirthDate(date));
  };

  /**
   * =========================================================
   * SUBMIT VERIFICATION
   * =========================================================
   */

  const submitVerification = async () => {
    /**
     * ---------------------------------------------------
     * CHECK ID
     * ---------------------------------------------------
     */

    if (!frontImage || !backImage) {
      Alert.alert(
        "Missing ID",
        "Please capture both the front and back of your ID.",
      );

      return;
    }

    /**
     * ---------------------------------------------------
     * CHECK SELFIE
     * ---------------------------------------------------
     */

    if (!selfieImage) {
      Alert.alert(
        "Face Verification Required",
        "Please take a selfie before continuing.",
      );

      return;
    }

    /**
     * ---------------------------------------------------
     * CHECK REQUIRED FIELDS
     * ---------------------------------------------------
     */

    if (
      !selectedIdType ||
      !extractedInfo.idNumber ||
      !extractedInfo.lastName ||
      !extractedInfo.firstName ||
      !extractedInfo.dateOfBirth
    ) {
      Alert.alert(
        "Incomplete Information",
        "Please review your information and make sure all required fields are complete.",
      );

      setEditing(true);

      return;
    }

    /**
     * ---------------------------------------------------
     * VALIDATE / FORMAT DATE
     * ---------------------------------------------------
     *
     * No matter what format OCR produced,
     * Laravel will receive:
     *
     * YYYY-MM-DD
     *
     * Example:
     *
     * 08/24/2026
     * ->
     * 2026-08-24
     */

    const dateOfBirth = formatDateForLaravel(extractedInfo.dateOfBirth);

    if (!dateOfBirth) {
      Alert.alert(
        "Invalid Date of Birth",
        "Please select a valid date of birth.",
      );

      setEditing(true);

      return;
    }

    /**
     * Optional debugging.
     *
     * You should see:
     *
     * DATE BEFORE SUBMIT: 2026-08-24
     */

    console.log("DATE BEFORE SUBMIT:", dateOfBirth);

    try {
      setIsProcessing(true);

      const formData = new FormData();

      /**
       * ---------------------------------------------------
       * TEXT DATA
       * ---------------------------------------------------
       */

      formData.append("id_type", selectedIdType);

      formData.append("id_number", extractedInfo.idNumber);

      formData.append("last_name", extractedInfo.lastName);

      formData.append("first_name", extractedInfo.firstName);

      formData.append("middle_name", extractedInfo.middleName);

      /**
       * IMPORTANT:
       *
       * Send YYYY-MM-DD to Laravel.
       */

      formData.append("date_of_birth", dateOfBirth);

      formData.append("address", extractedInfo.address);

      /**
       * ---------------------------------------------------
       * ID FRONT
       * ---------------------------------------------------
       */

      formData.append("id_front_image", {
        uri: frontImage,
        name: "id_front.jpg",
        type: "image/jpeg",
      } as any);

      /**
       * ---------------------------------------------------
       * ID BACK
       * ---------------------------------------------------
       */

      formData.append("id_back_image", {
        uri: backImage,
        name: "id_back.jpg",
        type: "image/jpeg",
      } as any);

      /**
       * ---------------------------------------------------
       * SELFIE
       * ---------------------------------------------------
       */

      formData.append("face_image", {
        uri: selfieImage,
        name: "face.jpg",
        type: "image/jpeg",
      } as any);

      /**
       * ---------------------------------------------------
       * SEND TO LARAVEL
       * ---------------------------------------------------
       */

      const response = await axios.post("/verification/identity", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("VERIFICATION RESPONSE:", response.data);

      await getUser();

      Alert.alert(
        "Verification Submitted",
        "Your identity verification has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              resetScanner();

              router.dismissAll();

              router.replace("/home");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("VERIFICATION ERROR", error?.response?.data ?? error);

      /**
       * ---------------------------------------------------
       * LARAVEL VALIDATION
       * ---------------------------------------------------
       */

      if (error?.response?.status === 422) {
        const validationErrors = error?.response?.data?.errors;

        const firstError = validationErrors
          ? Object.values(validationErrors)?.[0]
          : null;

        Alert.alert(
          "Invalid Information",
          Array.isArray(firstError)
            ? String(firstError[0])
            : "Please check your information and try again.",
        );

        return;
      }

      /**
       * ---------------------------------------------------
       * EXISTING VERIFICATION
       * ---------------------------------------------------
       */

      if (error?.response?.status === 409) {
        Alert.alert(
          "Verification Pending",
          "You already have a verification request being reviewed.",
        );

        return;
      }

      /**
       * ---------------------------------------------------
       * AUTHENTICATION
       * ---------------------------------------------------
       */

      if (error?.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Please sign in again before submitting your verification.",
        );

        return;
      }

      /**
       * ---------------------------------------------------
       * SERVER ERROR
       * ---------------------------------------------------
       */

      Alert.alert(
        "Something Went Wrong",
        "We couldn't submit your verification. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="px-6 pb-10 pt-6">
          {/* =====================================================
              HEADER
          ====================================================== */}

          <View className="mb-7">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-sm text-primary">
                {scanStep === "SELECT_TYPE"
                  ? "Step 1 of 4"
                  : scanStep === "SCAN_FRONT"
                    ? "Step 2 of 4"
                    : scanStep === "SCAN_BACK"
                      ? "Step 2 of 4"
                      : scanStep === "FACE"
                        ? "Step 3 of 4"
                        : "Step 4 of 4"}
              </Text>

              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Identity Verification
              </Text>
            </View>

            <View className="flex-row gap-2">
              {[0, 1, 2, 3].map((item) => {
                const active = item < Math.ceil(progress / 25);

                return (
                  <View
                    key={item}
                    className={`h-2 flex-1 rounded-full ${
                      active ? "bg-primary" : "bg-muted"
                    }`}
                  />
                );
              })}
            </View>
          </View>

          {/* =====================================================
              TITLE
          ====================================================== */}

          <View className="mb-7">
            <Text className="font-quicksand-bold text-2xl">
              Verify Your Identity
            </Text>

            <Text className="mt-2 font-quicksand-medium text-sm leading-5 text-muted-foreground">
              Verify your identity securely using your government ID and a
              selfie.
            </Text>
          </View>

          {/* =====================================================
              STEP 1
          ====================================================== */}

          {scanStep === "SELECT_TYPE" && (
            <View className="gap-5">
              <View className="rounded-3xl border border-border bg-card p-5">
                <View className="mb-5">
                  <Text className="font-quicksand-bold text-base">
                    Choose your ID
                  </Text>

                  <Text className="mt-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
                    Select a valid government-issued ID that belongs to you.
                  </Text>
                </View>

                <Select
                  label="Government ID"
                  placeholder="Select ID type"
                  items={idTypes}
                  value={selectedIdType}
                  onChange={(value) => {
                    setSelectedIdType(value);

                    setScanStep("SCAN_FRONT");
                  }}
                />
              </View>

              <InfoCard
                icon={ScanLine}
                title="Prepare your ID"
                description="Place your ID on a flat surface. Make sure the text is visible and there is no glare."
              />

              <InfoCard
                icon={ShieldCheck}
                title="Your information is protected"
                description="Your verification information will only be used to verify your identity."
              />
            </View>
          )}

          {/* =====================================================
              STEP 2
          ====================================================== */}

          {(scanStep === "SCAN_FRONT" || scanStep === "SCAN_BACK") && (
            <View className="gap-5">
              {/* SELECTED ID */}

              <View className="flex-row items-center rounded-2xl bg-secondary px-4 py-3">
                <View className="flex-1">
                  <Text className="font-quicksand-medium text-xs text-muted-foreground">
                    Selected ID
                  </Text>

                  <Text className="mt-1 font-quicksand-bold">
                    {selectedIdType}
                  </Text>
                </View>

                <Pressable
                  onPress={resetScanner}
                  className="rounded-full bg-background px-3 py-2"
                >
                  <Text className="font-quicksand-bold text-xs text-primary">
                    Change
                  </Text>
                </Pressable>
              </View>

              {/* FRONT */}

              <ScanCard
                title="Front of ID"
                description="Capture the front side"
                image={frontImage}
                completed={!!frontImage}
                loading={isProcessing && scanStep === "SCAN_FRONT"}
                onScan={() => openCamera("front")}
              />

              {/* BACK */}

              <ScanCard
                title="Back of ID"
                description="Capture the back side"
                image={backImage}
                completed={!!backImage}
                loading={isProcessing && scanStep === "SCAN_BACK"}
                disabled={!frontImage}
                onScan={() => openCamera("back")}
              />

              {isProcessing && (
                <View className="flex-row items-center justify-center gap-3 py-2">
                  <ActivityIndicator />

                  <Text className="font-quicksand-medium text-sm text-muted-foreground">
                    Reading your ID...
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* =====================================================
              STEP 3 — FACE
          ====================================================== */}

          {scanStep === "FACE" && (
            <View className="gap-5">
              <View className="items-center rounded-3xl border border-border bg-card px-5 py-7">
                <View className="size-20 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    as={UserRound}
                    size={38}
                    strokeWidth={1.6}
                    className="text-primary"
                  />
                </View>

                <Text className="mt-5 text-center font-quicksand-bold text-xl">
                  Face Verification
                </Text>

                <Text className="mt-2 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
                  Take a clear selfie so we can verify that you are the person
                  shown on your ID.
                </Text>
              </View>

              <View className="rounded-3xl bg-secondary p-5">
                <Text className="font-quicksand-bold text-sm">
                  Before taking your selfie
                </Text>

                <View className="mt-4 gap-3">
                  <Instruction text="Make sure your face is clearly visible." />

                  <Instruction text="Remove sunglasses, masks, or anything covering your face." />

                  <Instruction text="Use a well-lit area and avoid strong backlighting." />

                  <Instruction text="Look directly at the camera." />
                </View>
              </View>

              {/* SELFIE */}

              {selfieImage ? (
                <View className="overflow-hidden rounded-3xl border border-border bg-card p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View>
                      <Text className="font-quicksand-bold">
                        Selfie captured
                      </Text>

                      <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                        Make sure your face is clearly visible.
                      </Text>
                    </View>

                    <View className="rounded-full bg-primary/10 px-3 py-1">
                      <Text className="font-quicksand-bold text-xs text-primary">
                        Ready
                      </Text>
                    </View>
                  </View>

                  <Image
                    source={{
                      uri: selfieImage,
                    }}
                    className="h-80 w-full rounded-2xl bg-black"
                    resizeMode="cover"
                  />

                  <Button
                    variant="outline"
                    onPress={captureFace}
                    className="mt-4 rounded-full"
                    disabled={isProcessing}
                  >
                    <Icon as={RefreshCcw} size={17} strokeWidth={1.8} />

                    <Text className="font-quicksand-semibold">
                      Retake Selfie
                    </Text>
                  </Button>

                  <Button
                    onPress={() => setScanStep("RESULTS")}
                    className="mt-3 rounded-full"
                  >
                    <Icon as={Check} size={18} className="text-white" />

                    <Text className="font-quicksand-bold text-white">
                      Continue
                    </Text>
                  </Button>
                </View>
              ) : (
                <View className="overflow-hidden rounded-3xl bg-secondary p-4">
                  <View className="h-80 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-background">
                    <View className="size-20 items-center justify-center rounded-full bg-primary/10">
                      <Icon
                        as={Camera}
                        size={34}
                        strokeWidth={1.6}
                        className="text-primary"
                      />
                    </View>

                    <Text className="mt-4 font-quicksand-bold">
                      Ready for your selfie?
                    </Text>

                    <Text className="mt-1 px-5 text-center font-quicksand-medium text-xs text-muted-foreground">
                      Center your face and look directly at the camera.
                    </Text>

                    <Button
                      onPress={captureFace}
                      disabled={isProcessing}
                      className="mt-5 rounded-full px-6"
                    >
                      {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Icon as={Camera} size={18} className="text-white" />

                          <Text className="font-quicksand-bold text-white">
                            Take Selfie
                          </Text>
                        </>
                      )}
                    </Button>
                  </View>
                </View>
              )}

              <View className="flex-row gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <View className="size-9 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    as={ShieldCheck}
                    size={18}
                    strokeWidth={1.8}
                    className="text-primary"
                  />
                </View>

                <Text className="flex-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
                  Your selfie is used only for identity verification. Do not use
                  another person's photo.
                </Text>
              </View>
            </View>
          )}

          {/* =====================================================
              STEP 4 — RESULTS
          ====================================================== */}

          {scanStep === "RESULTS" && (
            <View className="gap-5">
              <View className="items-center py-2">
                <View className="size-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    as={Check}
                    size={32}
                    strokeWidth={2}
                    className="text-primary"
                  />
                </View>

                <Text className="mt-4 font-quicksand-bold text-xl">
                  Verification Ready
                </Text>

                <Text className="mt-1 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
                  Review your information and selfie before submitting your
                  verification.
                </Text>
              </View>

              {/* ID PHOTOS */}

              <View className="flex-row gap-3">
                {frontImage && (
                  <View className="flex-1">
                    <Text className="mb-2 font-quicksand-bold text-xs text-muted-foreground">
                      FRONT
                    </Text>

                    <Image
                      source={{
                        uri: frontImage,
                      }}
                      className="h-28 w-full rounded-2xl bg-black"
                      resizeMode="contain"
                    />
                  </View>
                )}

                {backImage && (
                  <View className="flex-1">
                    <Text className="mb-2 font-quicksand-bold text-xs text-muted-foreground">
                      BACK
                    </Text>

                    <Image
                      source={{
                        uri: backImage,
                      }}
                      className="h-28 w-full rounded-2xl bg-black"
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>

              {/* SELFIE */}

              {selfieImage && (
                <View className="rounded-3xl border border-border bg-card p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View>
                      <Text className="font-quicksand-bold">
                        Face Verification
                      </Text>

                      <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                        Selfie captured successfully
                      </Text>
                    </View>

                    <View className="rounded-full bg-primary/10 px-3 py-1">
                      <Text className="font-quicksand-bold text-xs text-primary">
                        Ready
                      </Text>
                    </View>
                  </View>

                  <Image
                    source={{
                      uri: selfieImage,
                    }}
                    className="h-56 w-full rounded-2xl bg-black"
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* INFORMATION */}

              <View className="rounded-3xl border border-border bg-card p-5">
                <View className="mb-5 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-base">
                      Extracted Information
                    </Text>

                    <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                      {selectedIdType}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setEditing(!editing)}
                    className="rounded-full bg-secondary px-3 py-2"
                  >
                    <Text className="font-quicksand-bold text-xs text-primary">
                      {editing ? "Done" : "Edit"}
                    </Text>
                  </Pressable>
                </View>

                <ResultField
                  label="ID Number"
                  value={extractedInfo.idNumber}
                  editing={editing}
                  onChange={(value) => updateField("idNumber", value)}
                />

                <ResultField
                  label="Last Name"
                  value={extractedInfo.lastName}
                  editing={editing}
                  onChange={(value) => updateField("lastName", value)}
                />

                <ResultField
                  label="First Name"
                  value={extractedInfo.firstName}
                  editing={editing}
                  onChange={(value) => updateField("firstName", value)}
                />

                <ResultField
                  label="Middle Name"
                  value={extractedInfo.middleName}
                  editing={editing}
                  onChange={(value) => updateField("middleName", value)}
                />

                {/* =================================================
                    DATE OF BIRTH — DATE PICKER
                ================================================== */}

                {editing ? (
                  <View className="mb-4">
                    <DatePicker
                      label="Date of Birth"
                      placeholder="Select date of birth"
                      value={birthDate}
                      onChange={handleBirthDateChange}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      minimumDate={new Date(1900, 0, 1)}
                      maximumDate={new Date()}
                    />
                  </View>
                ) : (
                  <ResultField
                    label="Date of Birth"
                    value={extractedInfo.dateOfBirth}
                    editing={false}
                    onChange={() => {}}
                  />
                )}

                <ResultField
                  label="Address"
                  value={extractedInfo.address}
                  editing={editing}
                  onChange={(value) => updateField("address", value)}
                />
              </View>

              {/* CHECKLIST */}

              <View className="rounded-3xl border border-primary/10 bg-primary/5 p-5">
                <Text className="font-quicksand-bold text-sm">
                  Verification checklist
                </Text>

                <View className="mt-4 gap-3">
                  <ChecklistItem
                    title="Government ID"
                    description="Front and back captured"
                  />

                  <ChecklistItem
                    title="ID information"
                    description="Information extracted successfully"
                  />

                  <ChecklistItem
                    title="Face photo"
                    description="Selfie captured"
                  />
                </View>
              </View>

              {/* SUBMIT */}

              <Button
                onPress={submitVerification}
                disabled={isProcessing}
                className="rounded-full"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon as={ShieldCheck} size={18} className="text-white" />

                    <Text className="font-quicksand-bold text-white">
                      Submit Verification
                    </Text>
                  </>
                )}
              </Button>

              {/* START OVER */}

              <Button
                variant="outline"
                onPress={resetScanner}
                disabled={isProcessing}
                className="rounded-full"
              >
                <Icon as={RotateCcw} size={18} strokeWidth={1.8} />

                <Text className="font-quicksand-semibold">Start Over</Text>
              </Button>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

/**
 * =========================================================
 * INFO CARD
 * =========================================================
 */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row gap-3 rounded-3xl border border-primary/10 bg-primary/5 p-5">
      <View className="size-10 items-center justify-center rounded-full bg-primary/10">
        <Icon as={icon} size={20} strokeWidth={1.8} className="text-primary" />
      </View>

      <View className="flex-1">
        <Text className="font-quicksand-bold text-sm">{title}</Text>

        <Text className="mt-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
          {description}
        </Text>
      </View>
    </View>
  );
}

/**
 * =========================================================
 * INSTRUCTION
 * =========================================================
 */

function Instruction({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="size-6 items-center justify-center rounded-full bg-primary/10">
        <Icon as={Check} size={14} strokeWidth={2} className="text-primary" />
      </View>

      <Text className="flex-1 font-quicksand-medium text-xs leading-5">
        {text}
      </Text>
    </View>
  );
}

/**
 * =========================================================
 * CHECKLIST
 * =========================================================
 */

function ChecklistItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="size-8 items-center justify-center rounded-full bg-primary/10">
        <Icon as={Check} size={16} strokeWidth={2} className="text-primary" />
      </View>

      <View className="flex-1">
        <Text className="font-quicksand-bold text-xs">{title}</Text>

        <Text className="mt-0.5 font-quicksand-medium text-[11px] text-muted-foreground">
          {description}
        </Text>
      </View>
    </View>
  );
}

/**
 * =========================================================
 * SCAN CARD
 * =========================================================
 */

function ScanCard({
  title,
  description,
  image,
  completed,
  loading,
  disabled,
  onScan,
}: {
  title: string;
  description: string;
  image: string | null;
  completed: boolean;
  loading: boolean;
  disabled?: boolean;
  onScan: () => void;
}) {
  return (
    <View
      className={`rounded-3xl border border-border bg-card p-4 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {/* HEADER */}

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-quicksand-bold">{title}</Text>

          <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
            {completed ? "Successfully captured" : description}
          </Text>
        </View>

        {completed && (
          <View className="rounded-full bg-primary/10 px-3 py-1">
            <Text className="font-quicksand-bold text-xs text-primary">
              Done
            </Text>
          </View>
        )}
      </View>

      {/* IMAGE */}

      {image ? (
        <>
          <Image
            source={{
              uri: image,
            }}
            className="h-48 w-full rounded-2xl bg-black"
            resizeMode="contain"
          />

          <Button
            variant="outline"
            onPress={onScan}
            disabled={loading}
            className="mt-3 rounded-full"
          >
            <Icon as={RefreshCcw} size={16} strokeWidth={1.8} />

            <Text className="font-quicksand-semibold">Retake</Text>
          </Button>
        </>
      ) : (
        <View className="h-48 items-center justify-center rounded-2xl bg-secondary">
          <View className="mb-3 size-12 items-center justify-center rounded-full bg-background">
            <Icon
              as={Camera}
              size={23}
              strokeWidth={1.7}
              className="text-primary"
            />
          </View>

          <Button
            onPress={onScan}
            disabled={loading || disabled}
            className="rounded-full px-6"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon as={Camera} size={18} className="text-white" />

                <Text className="font-quicksand-semibold text-white">
                  Scan ID
                </Text>
              </>
            )}
          </Button>
        </View>
      )}
    </View>
  );
}

/**
 * =========================================================
 * RESULT FIELD
 * =========================================================
 */

function ResultField({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1 font-quicksand-medium text-xs text-muted-foreground">
        {label}
      </Text>

      {editing ? (
        <Input
          value={value}
          onChangeText={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline={label === "Address"}
        />
      ) : (
        <Text className="font-quicksand-semibold leading-5">
          {value || "Not detected"}
        </Text>
      )}
    </View>
  );
}
