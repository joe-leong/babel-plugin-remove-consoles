// - @babel/cli，babel 脚手架工具
// - @babel/core，babel 核心
// - @babel/preset-env，一些预设
// - @babel/generator，代码生成
// - @babel/parser，转化
// - @babel/types，主要用来创建、判断类型等 搭配@babel/generator来生成代码
// - @babel/template，基于模板辅助创建 ast
const isProduction = process.env.NODE_ENV === 'production';
const isArray = arg => Object.prototype.toString.call(arg) === '[object Array]';


const isCommentReseve = (node) => {
  return ['CommentBlock','CommentLine'].includes(node.type) && /no[t]? remove\b/.test(node.value)
}
/**
 *
 * @param {object} node
 * @returns bool
 * eg: let a = 123
 *     // comment (this is also target)
 *     // comment (this is leading target)
 *      console.log()
 *     // comment (trailingComments)
 */
const hasLeadingComments = (node) => {
  const leadingComments = node.leadingComments
  return leadingComments && leadingComments.length
}

const hasTrailingComment = (node) => {
  const trailingComments = node.trailingComments
  return trailingComments && trailingComments.length
}

const removeConsolesHelper = (path, calleePath, exclude) => {
  // 配置不需要移除的log类型，eg:console.error
  if (isArray(exclude)) {
    const hasTarget = exclude.some(type => {
      return calleePath.matchesPattern('console.' + type)
    })
    if(hasTarget) return
  }
  // 排除项中没有匹配上则继续执行
  // 获取父ast
  const parentPath = path.parentPath
  // 获取父ast的子节点
  const parentNode = parentPath.node
  // 获取注释节点 是否保留log
  // 前缀注释
  let leadingReserve = false
  // 后缀注释
  let trailingReserve = false
  // 判断是否有前缀注释
  if (hasLeadingComments(parentNode)) {
    parentNode.leadingComments.forEach(comment => {
      // belongCurrentLine属于上一个log的同行注释，上一个log的前置注释不会被下一个log获取到
      if (isCommentReseve(comment) && !comment.belongCurrentLine) {
        leadingReserve = true
      }
    });
  }
  // 判断是否有后置注释 查找的是同行的注释
  if (hasTrailingComment(parentNode)) {
     const {
      start: { line: currentLine }
    } = parentNode.loc; // 当前父级的行数
    parentNode.trailingComments.forEach(comment => {
       const {
          start: { line: currentCommentLine }
        } = comment.loc; // 当前的行数
        if (currentLine === currentCommentLine) {
          comment.belongCurrentLine = true;
        }
      if (isCommentReseve(comment) && comment.belongCurrentLine) {
        trailingReserve = true
      }
    });
  }
  // 没有前后置注释保留
  if (!leadingReserve && !trailingReserve) {
    path.remove()
  }
}

/**
 * path.get 获取拥有某个属性的path
 * path.mathesPattern babel的匹配模式
 * path.remove 删除当前节点
 */
const visitor = {
  CallExpression(path, { opts }) {
    // exclude 需要保护的
    let { env, exclude } = opts
    let calleePath = path.get('callee')
    if (calleePath && calleePath.matchesPattern('console', true)) {
      // 开始处理当前节点，以当前节点为上下文查找内容
      removeConsolesHelper(path, calleePath, exclude)
    }
  }
}

module.exports = () => {
  return {
    name: 'remove-consoles',
    visitor
  }
}
