docker run -d \
-p 1935:1935 \
-p 3333:3333 \
-p 3334:3334 \
-p 3478:3478 \
-p 3274:3274 \
-p 3275:3275 \
-p 48081:48081 \
-p 9000:9000 \
-p 9999:9999/udp \
-p 4000-4005:4000-4005/udp \
-p 10006-10010:10006-10010/udp \
-v ome-origin-conf:/opt/ovenmediaengine/bin/origin_conf \
-v ome-edge-conf:/opt/ovenmediaengine/bin/edge_conf \
-v /etc/letsencrypt:/root/certificates \
--name ovenmediaengine \
airensoft/ovenmediaengine:latest