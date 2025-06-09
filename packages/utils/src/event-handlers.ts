/**
 * Event handling utilities for React and DOM applications
 * Provides higher-order functions to handle common event scenarios
 */

// 使用泛型约束来确保类型安全
type EventHandler<T> = (event: T) => void | Promise<void>;
type EventWrapper<T> = (handler?: EventHandler<T>) => EventHandler<T>;

/**
 * 阻止事件的默认行为
 */
export function preventDefault<T extends { preventDefault(): void }>(
  handler?: EventHandler<T>
): EventHandler<T> {
  return (event: T) => {
    event.preventDefault();
    handler?.(event);
  };
}

/**
 * 阻止事件冒泡
 */
export function stopPropagation<T extends { stopPropagation(): void }>(
  handler?: EventHandler<T>
): EventHandler<T> {
  return (event: T) => {
    event.stopPropagation();
    handler?.(event);
  };
}

/**
 * 同时阻止默认行为和事件冒泡
 */
export function preventDefaultAndStopPropagation<T extends { preventDefault(): void; stopPropagation(): void }>(
  handler?: EventHandler<T>
): EventHandler<T> {
  return (event: T) => {
    event.preventDefault();
    event.stopPropagation();
    handler?.(event);
  };
}

/**
 * 鼠标事件处理器
 */
export const mouse = {
  /**
   * 阻止鼠标事件的默认行为
   */
  preventDefault: <T extends { preventDefault(): void }>(handler?: EventHandler<T>) => 
    preventDefault(handler),

  /**
   * 阻止鼠标事件冒泡
   */
  stopPropagation: <T extends { stopPropagation(): void }>(handler?: EventHandler<T>) => 
    stopPropagation(handler),

  /**
   * 阻止鼠标事件的默认行为和冒泡
   */
  preventDefaultAndStopPropagation: <T extends { preventDefault(): void; stopPropagation(): void }>(
    handler?: EventHandler<T>
  ) => preventDefaultAndStopPropagation(handler),

  /**
   * 只在鼠标左键点击时执行处理器
   */
  leftClickOnly: <T extends { button: number }>(handler: EventHandler<T>) => {
    return (event: T) => {
      if (event.button === 0) { // 左键
        handler(event);
      }
    };
  },

  /**
   * 防止双击选中文本，同时执行处理器
   */
  preventTextSelection: <T extends { detail: number; preventDefault(): void }>(
    handler?: EventHandler<T>
  ) => {
    return (event: T) => {
      if (event.detail > 1) { // 多次点击
        event.preventDefault();
      }
      handler?.(event);
    };
  }
};

/**
 * 键盘事件处理器
 */
export const keyboard = {
  /**
   * 阻止键盘事件的默认行为
   */
  preventDefault: <T extends { preventDefault(): void }>(handler?: EventHandler<T>) => 
    preventDefault(handler),

  /**
   * 阻止键盘事件冒泡
   */
  stopPropagation: <T extends { stopPropagation(): void }>(handler?: EventHandler<T>) => 
    stopPropagation(handler),

  /**
   * 只在特定按键时执行处理器
   */
  onKey: <T extends { key: string }>(
    key: string | string[], 
    handler: EventHandler<T>
  ) => {
    const keys = Array.isArray(key) ? key : [key];
    return (event: T) => {
      if (keys.includes(event.key)) {
        handler(event);
      }
    };
  },

  /**
   * 在Enter键按下时执行处理器，并阻止默认行为
   */
  onEnter: <T extends { key: string; preventDefault(): void }>(handler: EventHandler<T>) => {
    return (event: T) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handler(event);
      }
    };
  },

  /**
   * 在Escape键按下时执行处理器
   */
  onEscape: <T extends { key: string }>(handler: EventHandler<T>) => {
    return (event: T) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };
  }
};

/**
 * 表单事件处理器
 */
export const form = {
  /**
   * 阻止表单提交的默认行为
   */
  preventDefault: <T extends { preventDefault(): void }>(handler?: EventHandler<T>) => 
    preventDefault(handler),

  /**
   * 处理表单提交，自动阻止默认行为
   */
  onSubmit: <T extends { preventDefault(): void }>(handler: EventHandler<T>) => {
    return (event: T) => {
      event.preventDefault();
      handler(event);
    };
  }
};

/**
 * 创建一个带延迟的事件处理器（防抖）
 */
export function debounce<T>(
  handler: EventHandler<T>,
  delay: number = 300
): EventHandler<T> {
  let timeoutId: NodeJS.Timeout;
  
  return (event: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(event), delay);
  };
}

/**
 * 创建一个限流的事件处理器（节流）
 */
export function throttle<T>(
  handler: EventHandler<T>,
  limit: number = 300
): EventHandler<T> {
  let inThrottle: boolean;
  
  return (event: T) => {
    if (!inThrottle) {
      handler(event);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 组合多个事件处理器
 */
export function combineHandlers<T>(
  ...handlers: Array<EventHandler<T>>
): EventHandler<T> {
  return (event: T) => {
    handlers.forEach(handler => handler(event));
  };
}

/**
 * 条件性执行事件处理器
 */
export function conditionalHandler<T>(
  condition: (event: T) => boolean,
  handler: EventHandler<T>
): EventHandler<T> {
  return (event: T) => {
    if (condition(event)) {
      handler(event);
    }
  };
}

/**
 * 常用的事件处理器组合
 */
export const common = {
  /**
   * 安全的点击处理器：阻止默认行为和冒泡，只响应左键点击
   */
  safeClick: <T extends { button: number; preventDefault(): void; stopPropagation(): void }>(
    handler: EventHandler<T>
  ) => 
    combineHandlers(
      mouse.leftClickOnly(handler),
      mouse.preventDefaultAndStopPropagation()
    ),

  /**
   * 菜单项点击处理器：适用于下拉菜单等场景
   */
  menuItemClick: <T extends { preventDefault(): void; stopPropagation(): void }>(
    handler: EventHandler<T>
  ) => 
    mouse.preventDefaultAndStopPropagation(handler),

  /**
   * 对话框外部点击处理器：防止事件冒泡到对话框外部
   */
  dialogContentClick: <T extends { stopPropagation(): void }>() => 
    mouse.stopPropagation<T>(),

  /**
   * 输入框回车提交：在Enter键时执行处理器
   */
  inputEnterSubmit: <T extends { key: string; preventDefault(): void }>(
    handler: EventHandler<T>
  ) => 
    keyboard.onEnter(handler)
};