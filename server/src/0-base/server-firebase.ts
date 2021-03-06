import { firestore as firebaseFirestore } from 'firebase-admin';

export function toData<T>(
  qss: firebaseFirestore.QuerySnapshot,
): (T & { id: string })[];
export function toData<T>(
  pqss: Promise<firebaseFirestore.QuerySnapshot>,
): Promise<(T & { id: string })[]>;
export function toData<T>(
  dss: firebaseFirestore.DocumentSnapshot,
): T & { id: string };
export function toData<T>(
  pdss: Promise<firebaseFirestore.DocumentSnapshot>,
): Promise<T & { id: string }>;
export function toData<T>(
  ss:
    | firebaseFirestore.QuerySnapshot
    | Promise<firebaseFirestore.QuerySnapshot>
    | firebaseFirestore.DocumentSnapshot
    | Promise<firebaseFirestore.DocumentSnapshot>,
): T[] | T {
  const process = (
    ss: firebaseFirestore.QuerySnapshot | firebaseFirestore.DocumentSnapshot,
  ) => {
    if (ss instanceof firebaseFirestore.QuerySnapshot) {
      return ss.docs.map((dss) => ({
        id: dss.id,
        ...timestampToDateRecursively(dss.data()),
      }));
    } else {
      if (!ss.exists) return null as any;
      return {
        id: ss.id,
        ...timestampToDateRecursively(ss.data()),
      };
    }
  };

  if (ss.constructor?.name.match('Promise')) {
    return (ss as Promise<any>).then(process) as any;
  } else {
    return process(ss as any);
  }
}

export function timestampToDateRecursively(value: any): any {
  if (value == null) {
    return value;
  } else if (value.constructor === firebaseFirestore.Timestamp) {
    return value.toDate();
  } else if (Array.isArray(value)) {
    return value.map(timestampToDateRecursively);
  } else if (value.constructor === Object) {
    const converted: any = {};
    for (const key in value) {
      converted[key] = timestampToDateRecursively(value[key]);
    }
    return converted;
  } else {
    return value;
  }
}

export function timestampFromDateRecursively(value: any): any {
  if (value == null) {
    return value;
  } else if (value.constructor === Date) {
    return firebaseFirestore.Timestamp.fromDate(value);
  } else if (Array.isArray(value)) {
    return value.map(timestampFromDateRecursively);
  } else if (value.constructor === Object) {
    const converted: any = {};
    for (const key in value) {
      converted[key] = timestampFromDateRecursively(value[key]);
    }
    return converted;
  } else {
    return value;
  }
}
