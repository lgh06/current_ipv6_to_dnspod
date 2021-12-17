rem Open this file in ANSI / GBK / GB2312 encoding.
@rem 关闭Windows的临时IPV6地址功能，让IP地址改变得不那么频繁
%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
netsh interface IPv6 set privacy state=disable
pause