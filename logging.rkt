#lang racket

#| logging.rkt
    (c) 2019 Ryan McGowan <ryan@internally-combusted.net>
    
    Provides an easy way for various program subsystems to create their own loggers,
    which automatically feed into the main logger. 
    
    Log messages are timestamped and automatically tagged with the subsystem name and severity level.
    Example message: 
        11/10/2018 20:46:17 [network/info] Incoming connection accepted from 127.0.0.1.

    Example usage: 
        (define parentlog (make-logger 'parent)) ; make-logger is a builtin function for Racket
        (define-sublogger 'babylog parentlog)
        (start-logger)
        (log-babylog-warn "final warning")
        (log-babylog-fatal "whoops too late")
 |#
 
(provide start-logger
         demo-logger
         define-sublogger
         log-log-info)

; The parent logger for all other loggers. 
(define demo-logger (make-logger 'demo))

; A macro that, when given a name and a parent logger, creates the logger "name-logger"
; Also creates the functions
;   log-name-fatal
;   log-name-error
;   log-name-warning
;   log-name-info
;   log-name-debug
; which send messages with various severity levels to the appropriate loggers.
; The logging functions are used as normal functions, e.g., (log-graphics-warning "Oh, child! A warning!")

(define-syntax (define-sublogger stx)
    (syntax-case stx ()
        [(define-sublogger name parent) ; the syntax pattern to match
            (let ([topic-string (λ (log-name-symbol) (symbol->string (cadr (syntax->datum log-name-symbol))))])
                (with-syntax (
                    [name-logger (datum->syntax stx (string->symbol (string-append (topic-string #'name) "-logger")))]
                    [(log-name-level ...)
                     (map
                        (λ (level)
                            (datum->syntax stx (string->symbol (string-append "log-" (topic-string #'name) "-" level))))
                        '("fatal" "error" "warning" "info" "debug"))]
                    [(log-level-symbol ...)  '('fatal 'error 'warning 'info 'debug)])
                    ; the actual code to generate, with
                             ; name-logger: the logger's name, e.g, (graphics-logger)
                             ; log-name-level: the series (log-graphics-fatal), (log-graphics-error), etc.
                             ; log-level-symbol: the series 'fatal, 'error, etc., used in the generated log functions
                                ; for checking whether the logging system cares about a message based on its severity
                    ; the macro expands to generate five new functions, one for each severity level
                    #'(begin
                        (define name-logger (make-logger name parent))
                        (define (log-name-level string-expr)
                            (when (log-level? name-logger log-level-symbol)
                                (log-message name-logger log-level-symbol name string-expr (current-continuation-marks) #f))) ...)))]))

; the logging system's log
; so meta
(define-sublogger 'log demo-logger)

; Returns the date in the format YYYY-MM-DD_HH.MM.SS
(define (current-timestamp-for-file)
  (let ([now (seconds->date (current-seconds))])
    (format "~a-~a-~a_~a.~a.~a" (date-year now) (with-leading-zeroes (date-month now) 2) (with-leading-zeroes (date-day now) 2) (with-leading-zeroes (date-hour now) 2) (with-leading-zeroes (date-minute now) 2) (with-leading-zeroes (date-second now) 2))))

; Given a number, returns a string version of the number with leading zeroes to
; pad out to the given width, if needed, e.g.
;
; (with-leading-zeroes 5 4) -> "0005"
;
(define (with-leading-zeroes number width)
  (let* ([number-string (~a number)]
        [difference (- width (string-length number-string))])
    (string-append (if (positive? difference) (make-string difference #\0) "") number-string)))

; Returns the date in the format (M)M/(D)D/YYYY (H)H:MM:SS
(define (current-timestamp)
  (let ([now (seconds->date (current-seconds))])
    (format "~a/~a/~a ~a:~a:~a" (date-month now) (date-day now) (date-year now) (date-hour now) (with-leading-zeroes (date-minute now) 2) (with-leading-zeroes (date-second now) 2))))

; Create the /log directory and a timestamped logfile
; then listen for messages forever
(define (start-logger)
  (make-directory* "log")
  (let ([main-log-receiver (make-log-receiver demo-logger 'debug)]
        [log-file (open-output-file (string-append "log/demo" (current-timestamp-for-file) ".log") #:exists 'error)])
    (thread
        (λ () (let loop ()
            (define message-data (sync main-log-receiver))
            (fprintf log-file "~a [~a/~a] ~a~n" (current-timestamp) (vector-ref message-data 3) (vector-ref message-data 0) (vector-ref message-data 1))
            (flush-output log-file)
            (loop)))))
  )

; Test the logger
(define-sublogger 'test demo-logger)
(start-logger)
(log-log-info "Logging system started.")
(thread
    (λ () (for ([i 3]) ; I really like the λ symbol and wish it lived on my keyboard
           (log-test-debug "this should appear only when the logging system is set to care about debug messages")
           (log-test-info "just an fyi")
           (log-test-warning "something uncool has happened")
           (log-test-error "okay now there is a serious problem")
           (log-test-fatal "help i am dying"))))
(sleep 1)