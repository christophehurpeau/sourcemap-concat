
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

function SourceMapConcatenator(sourceMapGeneratorOptions) {
    this.sourceMap = new SourceMapGenerator(sourceMapGeneratorOptions);
    this.offset = 0;
}

SourceMapConcatenator.prototype.add = function(filePath, fileContents, sourceMap) {
    var lines = fileContents.split('\n').length;
    
    if (sourceMap && sourceMap.mappings.length > 0) {
        var upstreamSM = new SourceMapConsumer(sourceMap);
        upstreamSM.eachMapping(function(mapping) {
            this.sourceMap.addMapping({
                generated: {
                    line: this.offset + mapping.generatedLine,
                    column: mapping.generatedColumn
                },
                original: {
                    line: mapping.originalLine,
                    column: mapping.originalColumn
                },
                source: mapping.source,
                name: mapping.name
            });
        }.bind(this));
        if (upstreamSM.sourcesContent) {
            upstreamSM.sourcesContent.forEach(function(sourceContent, index) {
                this.sourceMap.setSourceContent(upstreamSM.sources[index], sourceContent);
            }.bind(this));
        }
    } else {
        for (var i = 1; i <= lines; i++) {
          this.sourceMap.addMapping({
            generated: {
                line: this.offset + i,
                column: 0
            },
            original: {
                line: i,
                column: 0
            },
            source: filePath
          });
        }
        this.sourceMap.setSourceContent(filePath, fileContents);
    }
    this.offset += lines;
};

module.exports.SourceMapConcatenator = SourceMapConcatenator;