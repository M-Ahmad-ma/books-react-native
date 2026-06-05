declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(
      sqlStatement: string,
      args?: any[],
      success?: (resultSet: any) => void,
      error?: (error: any) => void,
    ): Promise<any>;
  }

  export function openDatabase(
    options: { name: string; location: string },
    success?: () => void,
    error?: (error: any) => void,
  ): SQLiteDatabase;

  export function enablePromise(enable: boolean): void;
}
