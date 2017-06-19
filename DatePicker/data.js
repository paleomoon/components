(function () {
    var datepicker = {};
    var monthData;//一个月的所有数据
    var wrapper;//组件容器

    /**
     * 获取一个月的数据
     *
     * @param year 年
     * @param month 真实月份
     * @return 一个月的数据
     */
    datepicker.getMonthData = function (year, month) {
        var ret = [];

        //未传日期默认本月
        if (!year || !month) {
            var today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
        }

        //下月的第0天
        var curMonthLastDay = new Date(year, month, 0);
        //本月的天数-本月最后一天
        var curMonthDayNum = curMonthLastDay.getDate();

        //本月的第0天
        var lastMonthLastDay = new Date(year, month - 1, 0);
        //上月的天数-上月最后一天
        var lastMonthDayNum = lastMonthLastDay.getDate();

        var firstDay = new Date(year, month - 1, 1);

        //重新获取年月
        var year = firstDay.getFullYear();
        var month = firstDay.getMonth() + 1;

        //当月第一天星期几
        var firstDayWeekDay = firstDay.getDay();

        //需要显示的上一月的天数
        var lastMonthShowDays = firstDayWeekDay;
        //需要显示的下一月的天数
        var nextMonthShowDays = 42 - curMonthDayNum  - lastMonthShowDays;

        for (var i = 0; i < 6 * 7; i++) {
            var date = i - lastMonthShowDays + 1;
            var showDate = date;//用于显示的日期，因为date可能为负
            var thisMonth = month;//用于显示的月份

            if (date <= 0) {
                //上一月
                showDate = lastMonthDayNum + date;//上月多少号
                thisMonth = month - 1;
            }
            else if (date > curMonthDayNum) {
                //下一月
                showDate = date - curMonthDayNum;//下月多少号
                thisMonth = month + 1;
            }

            if (thisMonth === 0) {
                thisMonth = 12;
            }
            else if (thisMonth === 13) {
                thisMonth = 1;
            }
            //每天的数据
            ret.push({
                month: thisMonth,
                date: date,
                showDate: showDate
            });
        }

        return {
            year: year,
            month: month,
            days: ret
        };
    };

    /**
     * 获取需要渲染的HTML结构
     *
     * @param year 年
     * @param month 真实月份
     * @return HTML字符串
     */
    datepicker.getRenderData = function (year, month) {
        monthData = datepicker.getMonthData(year, month);
    	var html = '<div class="ui-datepicker-header">'+
            '<a href="#" class="ui-datepicker-btn ui-datepicker-pre-btn">&lt;</a>'+
            '<a href="#" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>'+
            '<span class="ui-datepicker-curr-month">'+
            monthData.year + '-' + monthData.month + 
            '</span>'+
       	'</div>'+
        '<div class="ui-datepicker-body">'+
           	'<table>'+
                '<thead>'+
                    '<tr>'+
                        '<th>日</th>'+
                        '<th>一</th>'+
                        '<th>二</th>'+
                        '<th>三</th>'+
                        '<th>四</th>'+
                        '<th>五</th>'+
                        '<th>六</th>'+
                    '</tr>'+
                '</thead>'+
                '<tbody>';

        for (var i = 0; i < monthData.days.length; i++) {
        	var thisDate = monthData.days[i];
        	if (i % 7 === 0) {
        		html +='<tr>';
        	}

            if (thisDate.date !== thisDate.showDate) {
                //非本月日期

                //添加自定义属性data-date，用于点击时获取日期
                html += '<td class="notCurMonthDay" data-date =' + thisDate.date + '>' + thisDate.showDate + '</td>';
            }
            else
            {
                //本月日期
                html += '<td data-date =' + thisDate.date + '>' + thisDate.showDate + '</td>';
            }
        	
        	if (i % 7 === 6) {
        		html +='</tr>';
        	}
        }

        html +='</tbody>'+
            '</table>'+
        '</div>';

        return html;
    };

    /**
     * 渲染显示
     *
     * @param direction 'pre'-上月 'next'-下月
     */
    datepicker.render = function (direction) {
        var year, month;
        if (monthData) {
            year = monthData.year;
            month = monthData.month;
        }

        if (direction === 'pre') {
            month--;
            if (month === 0) {
            	month = 12;
            	year--;
            }
        }
        else if (direction === 'next') {
            month++;
            if (month === 13) {
            	month = 1;
            	year++;
            }
        }

        //获取需要渲染的HTML结构
        var renderHTML = datepicker.getRenderData(year, month);

        wrapper = document.querySelector('.ui-datepicker-wrapper');
        if (!wrapper) {
	        wrapper = document.createElement("div");
	        wrapper.className = 'ui-datepicker-wrapper';
	        document.body.appendChild(wrapper);
		}
		wrapper.innerHTML = renderHTML;  
    };

    /**
     * 初始化组件并使用
     *
     * @param inputName 输入框选择符
     */
    datepicker.init = function (inputName) {
        //渲染显示
    	datepicker.render();

        var input = document.querySelector(inputName);
        var isOpen = false;
        //显示和隐藏
        input.addEventListener('click', function () {
            if (isOpen) {
            //隐藏
                wrapper.classList.remove('ui-datepicker-wrapper-show');
                isOpen = false;
            }
            else {
            //显示
                //input的位置
                var left = input.offsetLeft;
                var top = input.offsetTop;
                //input的高度
                var height = input.offsetHeight;

                wrapper.style.left = left + 'px';
                wrapper.style.top = top + height + 2 + 'px';

                wrapper.classList.add('ui-datepicker-wrapper-show');
                isOpen = true;
            }
        }, false);

        //利用冒泡，绑定切换月份和选择日期事件到wrapper
     	wrapper.addEventListener('click', function (e) {
            var target = e.target;

            //点击日期
            if (target.tagName.toLowerCase() === 'td') {
                //target.dataset.propName获取自定义data-propName属性
            	var inputDate = new Date(monthData.year, monthData.month - 1, target.dataset.date);
            	input.value = formate(inputDate);
            	wrapper.classList.remove('ui-datepicker-wrapper-show');
            	isOpen = false;
            }

            //切换月份
            if (target.classList.contains('ui-datepicker-btn')) {
                //上一月
                if (target.classList.contains('ui-datepicker-pre-btn')) {
                    datepicker.render('pre');
                }
                //下一月
                else if (target.classList.contains('ui-datepicker-next-btn')) {
                    datepicker.render('next');
                }
            }
            
        }, false);
    };

    //根据日期获取格式化日期字符串
    var formate = function (date) {
    	var dateStr = '';
    	//一位数则补0
    	var paddingNum = function (num) {
    		if (num <= 9) {
    			return '0' + num;
    		}
    		return num;
    	};
    	dateStr += date.getFullYear() + '-';
    	dateStr += paddingNum(date.getMonth() + 1) + '-';
    	dateStr += paddingNum(date.getDate());

    	return dateStr;
    };

    window.datepicker = datepicker;
})();

   

    //获取某年某月共有多少天
    /*
    var getMonthDayNum = function (year, month) {
        //判断是否是闰年
        var isLeapYear = function (year) {
            return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        };

        var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        var days = monthDays[month];
        if ( month == 1 && isLeapYear(year) ) {
            days = 29;
        }
        return days;
    };
    */

    