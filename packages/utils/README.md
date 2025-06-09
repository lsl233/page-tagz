# Utils Package

这个包提供了一系列实用工具函数，包括事件处理、表单验证、数据获取等。

## 事件处理器 (Event Handlers)

提供了一系列高阶函数来优雅地处理DOM和React事件，解决常见的事件处理场景。

### 特性

- ✅ **类型安全** - 使用TypeScript泛型约束确保类型安全
- ✅ **兼容性好** - 同时支持React事件和原生DOM事件
- ✅ **简洁易用** - 提供直观的API设计
- ✅ **功能丰富** - 覆盖常见的事件处理场景

### 基础用法

```typescript
import { mouse, keyboard, form, common } from '@/utils/event-handlers';

// 1. 阻止事件冒泡和默认行为
const handleMenuClick = common.menuItemClick(() => {
  console.log('菜单项被点击');
});

// 2. 安全的点击处理（只响应左键，阻止冒泡和默认行为）
const handleSafeClick = common.safeClick(() => {
  console.log('安全点击');
});

// 3. 键盘事件处理
const handleEnterSubmit = keyboard.onEnter(() => {
  console.log('按下了Enter键');
});

// 4. 表单提交处理
const handleFormSubmit = form.onSubmit(() => {
  console.log('表单提交');
});
```

### 在React组件中使用

```typescript
import React from 'react';
import { common, keyboard, debounce } from '@/utils/event-handlers';

function MyComponent() {
  // 菜单项点击
  const handleEdit = common.menuItemClick(() => {
    setEditOpen(true);
  });

  const handleDelete = common.menuItemClick(() => {
    setDeleteOpen(true);
  });

  // 搜索防抖
  const handleSearch = debounce((event) => {
    console.log('搜索:', event.target.value);
  }, 300);

  // 回车提交
  const handleEnterSubmit = keyboard.onEnter(() => {
    submitForm();
  });

  return (
    <div>
      {/* 下拉菜单项 */}
      <button onClick={handleEdit}>编辑</button>
      <button onClick={handleDelete}>删除</button>

      {/* 搜索输入框 */}
      <input onChange={handleSearch} placeholder="搜索..." />

      {/* 回车提交的输入框 */}
      <input onKeyDown={handleEnterSubmit} placeholder="按Enter提交" />
    </div>
  );
}
```

### API 参考

#### 基础函数

- `preventDefault<T>(handler?)` - 阻止默认行为
- `stopPropagation<T>(handler?)` - 阻止事件冒泡
- `preventDefaultAndStopPropagation<T>(handler?)` - 同时阻止默认行为和冒泡

#### 鼠标事件 (mouse)

- `mouse.preventDefault<T>(handler?)` - 阻止鼠标事件默认行为
- `mouse.stopPropagation<T>(handler?)` - 阻止鼠标事件冒泡
- `mouse.preventDefaultAndStopPropagation<T>(handler?)` - 阻止默认行为和冒泡
- `mouse.leftClickOnly<T>(handler)` - 只响应左键点击
- `mouse.preventTextSelection<T>(handler?)` - 防止双击选中文本

#### 键盘事件 (keyboard)

- `keyboard.preventDefault<T>(handler?)` - 阻止键盘事件默认行为
- `keyboard.stopPropagation<T>(handler?)` - 阻止键盘事件冒泡
- `keyboard.onKey<T>(key, handler)` - 特定按键响应
- `keyboard.onEnter<T>(handler)` - Enter键响应
- `keyboard.onEscape<T>(handler)` - Escape键响应

#### 表单事件 (form)

- `form.preventDefault<T>(handler?)` - 阻止表单默认行为
- `form.onSubmit<T>(handler)` - 表单提交处理

#### 工具函数

- `debounce<T>(handler, delay)` - 防抖处理
- `throttle<T>(handler, limit)` - 节流处理
- `combineHandlers<T>(...handlers)` - 组合多个处理器
- `conditionalHandler<T>(condition, handler)` - 条件性执行

#### 常用组合 (common)

- `common.safeClick<T>(handler)` - 安全点击（左键+阻止冒泡）
- `common.menuItemClick<T>(handler)` - 菜单项点击（阻止冒泡）
- `common.dialogContentClick<T>()` - 对话框内容点击（阻止冒泡）
- `common.inputEnterSubmit<T>(handler)` - 输入框回车提交

### 实际应用场景

#### 1. 下拉菜单处理

```typescript
// 在tag-nav-item.tsx中使用
const handleEditClick = common.menuItemClick(() => {
  setOpen(true);
});

<DropdownMenuItem onClick={handleEditClick}>
  编辑
</DropdownMenuItem>
```

#### 2. 书签操作

```typescript
// 在bookmark-list-item.tsx中使用
const handleEdit = common.menuItemClick(() => {
  setEditOpen(true);
});

const handleDelete = common.menuItemClick(() => {
  setDeleteOpen(true);
});

<Button onClick={handleEdit}>编辑</Button>
<Button onClick={handleDelete}>删除</Button>
```

#### 3. 对话框处理

```typescript
// 防止对话框内容点击时关闭对话框
const handleContentClick = common.dialogContentClick();

<DialogContent onClick={handleContentClick}>
  {/* 对话框内容 */}
</DialogContent>
```

### 类型安全

所有函数都使用TypeScript泛型约束来确保类型安全，会自动推断事件类型：

```typescript
// 自动推断为 MouseEvent<HTMLButtonElement>
<button onClick={common.safeClick(() => console.log('clicked'))}>
  点击我
</button>

// 自动推断为 KeyboardEvent<HTMLInputElement>
<input onKeyDown={keyboard.onEnter(() => console.log('enter pressed'))} />
``` 