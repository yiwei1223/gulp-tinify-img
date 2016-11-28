/**!
 * gulp-tinify-img 1.0.0 (c) 2016 Yi wei - MIT license
 * @desc 使用tinify进行图片压缩的gulp插件
 *       只支持jpeg & png格式
 */
'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var tinify = require("tinify");
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-tinify-img';
// 全局计数
var count = 0;

/**
 * @desc 插件主体
 * @param options
 *        {
 *          tinify_key: '',
 *          log: true || false
 *        }
 */
module.exports = function (options) {
    // 配置对象不能为空 || 配置对象必须包含一个可用的tinify key
    if (!options || !options.tinify_key) {
        throw new PluginError(PLUGIN_NAME, 'Missing tinify key');
    }
    // 设置key，一个有效的key是使用tinify的关键
    tinify.key = options.tinify_key;

    // 压缩处理
    return through.obj(function (file, enc, cb) {
        var that = this;
        if (options.log) console.log('-------------- ', PLUGIN_NAME, '：the ', ++count ,' image start compressed -----------------');
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            if (options.log) console.log('------------  file buffer：' , file.contents ,' ------------');
            tinify.fromBuffer(file.contents).toBuffer(function(err, resultData) {
                if (err) {
                    if (err instanceof tinify.AccountError) {
                        // Verify your API key and account limit.
                        throw new PluginError(PLUGIN_NAME, "The AccountError error message is: " + err.message);
                    } else if (err instanceof tinify.ClientError) {
                        // Check your source image and request options.
                        throw new PluginError(PLUGIN_NAME, "The ClientError message is: " + err.message);
                    } else if (err instanceof tinify.ServerError) {
                        // Temporary issue with the Tinify API.
                        throw new PluginError(PLUGIN_NAME, "The ServerError message is: " + err.message);
                    } else if (err instanceof tinify.ConnectionError) {
                        // A network connection error occurred.
                        throw new PluginError(PLUGIN_NAME, "The ConnectionError message is: " + err.message);
                    } else {
                        // Something else went wrong, unrelated to the Tinify API.
                        throw new PluginError(PLUGIN_NAME, "The UnknowError message is: " + err.message);
                    }
                }
                file.contents = resultData;
                if (options.log) console.log('-------------- ', PLUGIN_NAME, '：the ', count ,' image end compressed -----------------');
                if (options.log) console.log('-------------- compression count : ' + tinify.compressionCount + ' --------------');
                // 确保文件进入下一个 gulp 插件
                that.push(file);
                // 告诉 stream 引擎，我们已经处理完了这个文件
                cb && cb();
            });
        }
    });
};