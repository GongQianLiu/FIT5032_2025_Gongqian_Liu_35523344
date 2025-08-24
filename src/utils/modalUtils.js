// 模态框工具函数 - 解决Bootstrap模态框遮罩残留问题

/**
 * 清理所有模态框遮罩和相关样式
 */
export const cleanupModalBackdrops = () => {
  // 移除所有遮罩层
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.remove();
  });
  
  // 重置body样式
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  console.log('🧹 Modal backdrops cleaned up');
};

/**
 * 安全地打开Bootstrap模态框
 * @param {string} modalId - 模态框元素的ID
 * @param {Object} options - Bootstrap模态框选项
 * @returns {Object|null} - Bootstrap模态框实例或null
 */
export const safeOpenModal = (modalId, options = {}) => {
  // 先清理现有遮罩
  cleanupModalBackdrops();
  
  const modalElement = document.getElementById(modalId);
  if (!modalElement) {
    console.error(`Modal element with ID '${modalId}' not found`);
    return null;
  }
  
  if (!window.bootstrap) {
    console.error('Bootstrap not available');
    return null;
  }
  
  try {
    // 销毁现有实例
    const existingModal = window.bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
      existingModal.dispose();
    }
    
    // 创建新实例
    const modal = new window.bootstrap.Modal(modalElement, {
      backdrop: true,
      keyboard: true,
      focus: true,
      ...options
    });
    
    // 添加清理事件监听器
    modalElement.addEventListener('hidden.bs.modal', () => {
      cleanupModalBackdrops();
    }, { once: true });
    
    // 显示模态框
    modal.show();
    
    console.log(`✅ Modal '${modalId}' opened successfully`);
    return modal;
    
  } catch (error) {
    console.error(`Error opening modal '${modalId}':`, error);
    cleanupModalBackdrops(); // 出错时也要清理
    return null;
  }
};

/**
 * 安全地关闭Bootstrap模态框
 * @param {string} modalId - 模态框元素的ID
 */
export const safeCloseModal = (modalId) => {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) {
    console.error(`Modal element with ID '${modalId}' not found`);
    return;
  }
  
  if (!window.bootstrap) {
    console.error('Bootstrap not available');
    return;
  }
  
  try {
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  } catch (error) {
    console.error(`Error closing modal '${modalId}':`, error);
  }
  
  // 无论如何都要清理遮罩
  setTimeout(() => {
    cleanupModalBackdrops();
  }, 300); // 等待动画完成
};

/**
 * 初始化全局模态框清理
 * 在页面加载时调用，设置全局事件监听器
 */
export const initModalCleanup = () => {
  // 监听路由变化，清理遗留的遮罩
  if (window.addEventListener) {
    window.addEventListener('beforeunload', cleanupModalBackdrops);
    
    // 监听点击事件，如果点击的是遮罩层，强制清理
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) {
        setTimeout(cleanupModalBackdrops, 100);
      }
    });
    
    // 监听ESC键，清理遮罩
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setTimeout(cleanupModalBackdrops, 100);
      }
    });
  }
  
  console.log('🔧 Modal cleanup utilities initialized');
};

// 在浏览器环境中暴露到全局
if (typeof window !== 'undefined') {
  window.cleanupModalBackdrops = cleanupModalBackdrops;
  window.safeOpenModal = safeOpenModal;
  window.safeCloseModal = safeCloseModal;
  
  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalCleanup);
  } else {
    initModalCleanup();
  }
  
  console.log('🔧 Modal utilities available globally: window.cleanupModalBackdrops(), window.safeOpenModal(), window.safeCloseModal()');
}
