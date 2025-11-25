// Input validation utilities

export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: '密码不能为空' };
    }

    if (password.length < 6) {
        return { valid: false, error: '密码长度至少需要6位' };
    }

    if (password.length > 100) {
        return { valid: false, error: '密码长度不能超过100位' };
    }

    return { valid: true };
};

export const validateBlogPost = (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== 'string') {
        errors.push('标题不能为空');
    } else if (data.title.trim().length === 0) {
        errors.push('标题不能为空');
    } else if (data.title.length > 200) {
        errors.push('标题长度不能超过200字符');
    }

    if (!data.content || typeof data.content !== 'string') {
        errors.push('内容不能为空');
    } else if (data.content.trim().length === 0) {
        errors.push('内容不能为空');
    } else if (data.content.length > 100000) {
        errors.push('内容长度不能超过100000字符');
    }

    if (data.excerpt && typeof data.excerpt === 'string' && data.excerpt.length > 500) {
        errors.push('摘要长度不能超过500字符');
    }

    if (data.tags) {
        if (!Array.isArray(data.tags)) {
            errors.push('标签必须是数组');
        } else if (data.tags.length > 10) {
            errors.push('标签数量不能超过10个');
        } else {
            for (const tag of data.tags) {
                if (typeof tag !== 'string' || tag.length > 50) {
                    errors.push('每个标签长度不能超过50字符');
                    break;
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

export const sanitizeString = (str, maxLength = 1000) => {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
};
