export type StoredObject = {
  key: string;
  url: string;
  contentType: string;
};

export interface StorageDriver {
  put(input: { key: string; body: Buffer; contentType: string }): Promise<StoredObject>;
  getUrl(key: string): Promise<string>;
}
