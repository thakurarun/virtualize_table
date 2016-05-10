$(document).ready(function () {
    $('#PayementTable').clusterTable({
        renderRows: getRenderRows(),
        bindTo:"PayementTable"
    });
});

function getRenderRows() {
    return  Object.keys(renderRows).map(function(n){
        return renderRows[n];
    });
}