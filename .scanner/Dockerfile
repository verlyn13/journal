FROM golang:1.21 as builder

WORKDIR /app

RUN git clone https://github.com/boyter/scc.git &&     cd scc &&     go build

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/scc/scc .

ENTRYPOINT ["/app/scc"]
