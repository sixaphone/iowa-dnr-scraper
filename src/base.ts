export abstract class Base<T> {
  constructor(props: Partial<T>) {
    Object.assign(this, props);
  }
}
