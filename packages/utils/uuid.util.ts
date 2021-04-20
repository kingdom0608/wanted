import * as uuid from "uuid";

/**
 * UUID 생성
 * @returns string
 */
export function uuidV4(): string {
  return uuid.v4();
}

/**
 * UUID 검사
 * @param uuid
 * @returns {boolean}
 */
export function checkUuid(uuid): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    uuid
  );
}
