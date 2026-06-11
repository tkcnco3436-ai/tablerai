export type Lang = "ko" | "en";

const SPECS_BY_LANG: Record<Lang, ReadonlyArray<readonly [string, string]>> = {
  ko: [
    ["제품", "스테인리스 텀블러 (500ml / 750ml)"],
    ["인쇄", "실크 인쇄, 레이저 각인, 풀컬러 전사"],
    ["최소 수량", "50개부터"],
    ["납기", "시안 확정 후 영업일 기준 10~15일"],
    ["패키지", "단상자 / 파우치 옵션"],
  ],
  en: [
    ["Product", "Stainless tumbler (500ml / 750ml)"],
    ["Printing", "Silk screen, laser engraving, full-color transfer"],
    ["MOQ", "From 50 units"],
    ["Lead time", "10–15 business days after design approval"],
    ["Packaging", "Single box / pouch option"],
  ],
};

export const getSpecs = (lang: Lang) => SPECS_BY_LANG[lang];

// 기존 import 호환용 (한국어 기본)
export const SPECS = SPECS_BY_LANG.ko;

export const CONTACT_EMAIL = "jh6385@tkcnco.com";
