; (function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();
}("VirtualTable", function () {
    var VirtualTable = function (options) {
        if (typeof jQuery == 'undefined' || typeof $ == 'undefined')
            throw new Error("jQuery 1.7+ is required");
        if (!(this instanceof VirtualTable))
            return new VirtualTable(options);
        var self = this;
        var defaults = {
            scrollerId: null,
            contentId: null,
            renderRows: [],
            rows_in_block: 50,
            blocks_in_cluster: 4,
            tag: null,
            content_tag: null,
            show_no_data_row: true,
            no_data_class: 'virtualize-no-data',
            no_data_text: 'No data',
            callbacks: {},
            scroll_top: 0
        }


        self.cache = { blocks: [], currentCluster: 0, currentBlock : 0,scrollTop : 0 };
        self.options = $.extend({}, defaults, options);
        self.makeBlocks(options.renderRows);
        self.insertRows(self.makeClusterOfBlocks(self.cache.currentCluster));
        self.options.rowHeight = self.calculateRowHeight();
        self.options.block_height = self.options.rowHeight * self.options.rows_in_block;
        self.options.cluster_height = self.options.block_height * self.options.blocks_in_cluster;
        self.options.block_change_threshhold = 0;
        self.options.total_clusters = self.getTotalClusters();

        self.scroller.on('scroll', function (e) {
            self.updateOnScroll(this.scrollTop, this.scrollHeight - this.offsetHeight);
        });
    }

    VirtualTable.prototype = {
        constructor: VirtualTable,
        insertRows: function (rows) {
            var scroller = this.getScrollerItem();
            var table = this.getContentItem();
            table.empty();
            $.each(rows, function (i, n) {
                table.append(n);
            })
        },
        makeBlocks: function (rows) {
            var self = this;
            self.cache.blocks = [];
            var _block = [];
            var length = rows.length;
            $.each(rows, function (i, n) {
                if (i != 0 && i % self.options.rows_in_block == 0) {
                    self.cache.blocks.push(_block);
                    _block = [];
                }
                _block.push(n);
                if (i == length - 1)
                    self.cache.blocks.push(_block);
            });
        },
        makeClusterOfBlocks: function (index) {
            var blocks = this.cache.blocks.slice(index, this.options.blocks_in_cluster);
            var array = [];
            $.each(blocks, function (i, m) {
                array = array.concat(m);
            })
            return $.makeArray(array);
        },
        updateOnScroll: function (scrollTop, scrollHeight) {
            this.cache.scrollTop = scrollTop;
            if (this.cache.currentBlock == this.getCurrentBlock())
                return;
            this.cache.currentBlock = this.getCurrentBlock();
            var scrollPosition = this.getScrollProgress();
            console.log(scrollPosition + " " + this.cache.currentBlock + " " + this.getActualScrollHeight());
            if (this.cache.currentBlock == 2) {
                 this.prependTempRow();
            }
            if (this.cache.currentBlock == this.options.blocks_in_cluster) {
                console.log("user in last block")
               
            }
        },
        prependTempRow: function () {
            if (this.content.find("tr:first").hasClass("temp-row-vitual") == false) {
                var tr = $("<tr>");
                tr.addClass("temp-row-vitual");
                this.content.prepend(tr);
            }
            return;
        },
        getCurrentBlock: function () {
            return (Math.ceil(this.cache.scrollTop / this.options.block_height) % this.options.blocks_in_cluster) || this.options.blocks_in_cluster;
        },
        getCurrentCluster: function () {
            return Math.floor(this.options.scroll_top / (this.options.cluster_height - this.options.block_height)) || 0;
        },
        getTotalClusters: function () {
            return Math.ceil(this.cache.blocks.length / this.options.blocks_in_cluster);
        },
        getScrollProgress : function () {
            return this.cache.scrollTop / (this.options.renderRows.length * this.options.rowHeight) * 100 || 0;
        },
        getActualScrollHeight: function () {
            return this.options.renderRows.length * this.options.rowHeight;
        },
        getScrollerItem: function () {
            if (this.scroller)
                return this.scroller;
            return this.scroller = $("#" + this.options.scrollerId);
        },
        getContentItem: function () {
            if (this.content)
                return this.content;
            return this.content = $("#" + this.options.contentId);
        },
        calculateRowHeight: function () {
            var tr = this.getContentItem().find("tr:visible:eq(0)");
            if (tr)
                return tr.height();
            return 0;
        },
    }
    return VirtualTable;
}));