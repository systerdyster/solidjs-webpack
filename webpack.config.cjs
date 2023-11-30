/*jshint esversion: 6 */

const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

const miniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const terserJSPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = (env = {}, argv = {}) => {
    const isProduction = argv.mode === 'production';
    const shortEnvMode = (argv.mode === 'production') ? 'prod' : 'dev';

    console.log('Webpack mode: ' + argv.mode);

    // For external config files.
    process.env.NODE_ENV = argv.mode;

    var config = {
        entry: {
            'main': path.join(__dirname, 'src', 'index.tsx'),
        },

        output: {
            path: path.resolve(__dirname, 'www'),
            module: true
        },
        
        experiments: {
            outputModule: true
        },

        target: 'web',

        devServer: {
            port: 8000,
            hot: true,
            open: true,
            static: path.resolve(__dirname, 'www'),
            client: {
                overlay: {
                    warnings: false,
                    errors: true
                }
            }
        },

        plugins: [
            new htmlWebpackPlugin({
                template: './index.html',
                filename: 'index.html',
                title: 'SolidJs with Webpack',
                chunksSortMode: 'none',
                scriptLoading: 'module',
            }),
            new miniCssExtractPlugin({
                filename: (() => {
                    if (isProduction) return '[name]-[chunkhash:10].min.css';
                    else return '[name].css';
                })()
            }),
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(env?.VERSION ?? 'local'),
                __ENV__: JSON.stringify(shortEnvMode)
            })
        ],

        performance: {
            hints: 'warning' // 'warning' / 'error' / false
        },

        optimization: {
            minimize: isProduction,
            minimizer: [
                new terserJSPlugin({
                    terserOptions: {
                        keep_classnames: true,
                        keep_fnames: true
                    }
                }),
                new CssMinimizerPlugin()
            ]
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                      {
                        loader: 'babel-loader',
                        options: {
                          presets: ['solid'],
                        },
                      },
                      {
                        loader: 'ts-loader',
                      },
                    ],
                },
                {
                    test: /\.(css)$/,
                    use: [
                        {
                            loader: miniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: !isProduction
                            }
                        }
                    ],
                    include: [path.join(__dirname, 'src', 'styles')]
                },
                {
                    test: /\.(woff|woff2|ttf|eot)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[hash][ext][query]'
                    }
                },
                {
                    test: /\.(png|jpe?g|gif|svg|ico)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[hash][ext][query]'
                    }
                }
            ]
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.css', '.json', '.png'],
            modules: [path.resolve(__dirname, 'src', 'scripts'), path.resolve(__dirname, 'src', 'styles'), 'node_modules']
        }
    };

    if (isProduction) {
        config.devtool = false;
    } else {
        config.devtool = 'source-map';
        config.plugins.push(new ESLintPlugin({ extensions: ['ts'] }));
        config.plugins.push(new StylelintPlugin({
            extensions: ['css'],
            exclude: [
                path.resolve(__dirname, 'www')
            ]
        }));
    }

    return config;
};
