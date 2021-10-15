export interface LinkedListNode<T> {
  value: T;
  next?: LinkedListNode<T>;
}

export class LinkedList<T> {
  head: LinkedListNode<T> | undefined;

  tail: LinkedListNode<T> | undefined;

  push(value: T) {
    const node = { value };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
  }

  unshift(): T | undefined {
    if (!this.head) {
      return undefined;
    }
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = undefined;
    }
    return value;
  }
}
