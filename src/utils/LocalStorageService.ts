interface LocalStorageService {
    setItem<T>(key: string, value: T): void;
    getItem<T>(key: string): T | null;
    removeItem(key: string): void;
  }
  
  const localStorageService: LocalStorageService = {
    setItem<T>(key: string, value: T): void {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
  
    getItem<T>(key: string): T | null {
      try {
        const serializedValue = localStorage.getItem(key);
        return serializedValue ? JSON.parse(serializedValue) : null;
      } catch (error) {
        console.error('Error retrieving from localStorage:', error);
        return null;
      }
    },
  
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },
  };
  
  export default localStorageService;
  

//   // 存储数据
// const user = { name: 'John', age: 30 };
// localStorageService.setItem('user', user);

// // 获取数据
// const storedUser = localStorageService.getItem<{ name: string, age: number }>('user');
// console.log(storedUser); // { name: 'John', age: 30 }

// // 移除数据
// localStorageService.removeItem('user');